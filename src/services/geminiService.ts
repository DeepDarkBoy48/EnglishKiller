import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { AnalysisResult, DictionaryResult, WritingResult, WritingMode, Message } from '../types';

// API Key 管理
const API_KEY_STORAGE_KEY = 'GEMINI_API_KEY';

export const getApiKey = (): string | null => {
  return localStorage.getItem(API_KEY_STORAGE_KEY);
};

export const setApiKey = (key: string): void => {
  localStorage.setItem(API_KEY_STORAGE_KEY, key);
};

export const clearApiKey = (): void => {
  localStorage.removeItem(API_KEY_STORAGE_KEY);
};

// 创建 Gemini 客户端
const getClient = () => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('请先设置 Gemini API Key');
  }
  return new GoogleGenerativeAI(apiKey);
};

// Schema 定义
const analysisResultSchema = {
  type: SchemaType.OBJECT,
  properties: {
    chunks: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          text: { type: SchemaType.STRING },
          grammarDescription: { type: SchemaType.STRING },
          partOfSpeech: { type: SchemaType.STRING },
          role: { type: SchemaType.STRING },
        },
        required: ['text', 'grammarDescription', 'partOfSpeech', 'role'],
      },
    },
    detailedTokens: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          text: { type: SchemaType.STRING },
          partOfSpeech: { type: SchemaType.STRING },
          role: { type: SchemaType.STRING },
          explanation: { type: SchemaType.STRING },
          meaning: { type: SchemaType.STRING },
        },
        required: ['text', 'partOfSpeech', 'role', 'explanation', 'meaning'],
      },
    },
    chineseTranslation: { type: SchemaType.STRING },
    englishSentence: { type: SchemaType.STRING },
    correction: {
      type: SchemaType.OBJECT,
      nullable: true,
      properties: {
        original: { type: SchemaType.STRING },
        corrected: { type: SchemaType.STRING },
        errorType: { type: SchemaType.STRING },
        reason: { type: SchemaType.STRING },
        changes: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              type: { type: SchemaType.STRING },
              text: { type: SchemaType.STRING },
            },
            required: ['type', 'text'],
          },
        },
      },
      required: ['original', 'corrected', 'errorType', 'reason', 'changes'],
    },
    sentencePattern: { type: SchemaType.STRING, nullable: true },
    mainTense: { type: SchemaType.STRING, nullable: true },
  },
  required: ['chunks', 'detailedTokens', 'chineseTranslation', 'englishSentence'],
};

const dictionaryResultSchema = {
  type: SchemaType.OBJECT,
  properties: {
    word: { type: SchemaType.STRING },
    phonetic: { type: SchemaType.STRING },
    entries: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          partOfSpeech: { type: SchemaType.STRING },
          cocaFrequency: { type: SchemaType.STRING, nullable: true },
          definitions: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                meaning: { type: SchemaType.STRING },
                explanation: { type: SchemaType.STRING },
                example: { type: SchemaType.STRING },
                exampleTranslation: { type: SchemaType.STRING },
              },
              required: ['meaning', 'explanation', 'example', 'exampleTranslation'],
            },
          },
        },
        required: ['partOfSpeech', 'definitions'],
      },
    },
    collocations: {
      type: SchemaType.ARRAY,
      nullable: true,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          phrase: { type: SchemaType.STRING },
          meaning: { type: SchemaType.STRING },
          example: { type: SchemaType.STRING },
          exampleTranslation: { type: SchemaType.STRING },
        },
        required: ['phrase', 'meaning', 'example', 'exampleTranslation'],
      },
    },
  },
  required: ['word', 'phonetic', 'entries'],
};

const writingResultSchema = {
  type: SchemaType.OBJECT,
  properties: {
    mode: { type: SchemaType.STRING },
    generalFeedback: { type: SchemaType.STRING },
    segments: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          type: { type: SchemaType.STRING },
          text: { type: SchemaType.STRING },
          original: { type: SchemaType.STRING, nullable: true },
          reason: { type: SchemaType.STRING, nullable: true },
          category: { type: SchemaType.STRING, nullable: true },
        },
        required: ['type', 'text'],
      },
    },
  },
  required: ['mode', 'generalFeedback', 'segments'],
};

// --- 句子分析服务 ---
export const analyzeSentenceService = async (sentence: string): Promise<AnalysisResult> => {
  const client = getClient();
  const model = client.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: analysisResultSchema,
    },
  });

  const prompt = `
    你是一位精通语言学和英语教学的专家 AI。请分析以下英语句子： "${sentence}"。
    目标受众是正在学习英语的学生，因此分析需要**清晰、准确且具有教育意义**。

    **Processing Steps (Thinking Process):**
    1.  **Grammar Check (纠错)**: 
        - 仔细检查句子是否有语法错误。
        - 如果有错，创建一个修正后的版本。
        - **注意**：后续的所有分析（chunks, detailedTokens, structure）必须基于**修正后(Corrected)** 的句子进行。
        - **Diff Generation**: 生成 'changes' 数组时，必须是严格的文本差异对比 (diff)。
          - 'remove': 仅包含被删除的原文片段，**绝对不要**包含 "->" 符号或 "change x to y" 这样的描述。例如原句是 "i go"，修正为 "I go"，则 'remove' text 为 "i"，'add' text 为 "I"。
          - 'add': 仅包含新加入的片段。
          - 'keep': 保持不变的部分。

    2.  **Macro Analysis (宏观结构)**:
        - 识别核心句型结构 (Pattern)，**必须包含中文翻译**。格式要求："English Pattern (中文名称)"。例如："S + V + O (主谓宾)"。
        - 识别核心时态 (Tense)，**必须包含中文翻译**。格式要求："English Tense (中文名称)"。例如："Present Simple (一般现在时)"。

    3.  **Chunking (可视化意群分块)**:
        - 目标是展示句子的"节奏"和"意群"(Sense Groups)。
        - **原则**：
          - 所有的修饰语应与其中心词在一起（例如 "The very tall man" 是一个块）。
          - 介词短语通常作为一个整体（例如 "in the morning" 是一个块）。
          - 谓语动词部分合并（例如 "have been waiting" 是一个块）。
          - 不定式短语合并（例如 "to go home" 是一个块）。

    4.  **Detailed Analysis (逐词/短语详解)**:
        - **核心原则 - 固定搭配优先**：
          - 遇到短语动词 (phrasal verbs)、固定习语 (idioms)、介词搭配 (collocations) 时，**必须**将它们作为一个整体 Token，**绝对不要拆分**。
          - 例如："look forward to", "take care of", "a cup of", "depend on"。
          - **特别处理可分离短语动词 (Separable Phrasal Verbs)**：
            - 如果遇到像 "pop us back", "turn it on" 这样动词与小品词被代词隔开的情况，请务必**识别出其核心短语动词**（如 "pop back"）。
            - 在详细解释 (explanation) 中，**必须**明确指出该词属于短语动词 "pop back" (或相应短语)，并解释该短语动词的含义，而不仅仅是单个单词的意思。
            - 示例：针对 "pop us back"，在解释 "pop" 时，应说明 "pop ... back 是短语动词，意为迅速回去/放回"。
        - **解释 (Explanation)**：
          - 不要只给一个词性标签。要解释它在句子中的**功能**和**为什么用这种形式**。
          - 例如：不要只写"过去分词"，要写"过去分词，与 has 构成现在完成时，表示动作已完成"。
        - **含义 (Meaning)**：提供在当前语境下的中文含义。

    请返回 JSON 格式数据。
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = JSON.parse(text) as AnalysisResult;

    // Match frontend logic: use corrected sentence if available
    if (parsed.correction) {
      parsed.englishSentence = parsed.correction.corrected;
    } else {
      parsed.englishSentence = sentence;
    }

    return parsed;
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('无法分析该句子。请检查网络或 API Key 设置。');
  }
};

// --- 词典查询服务 ---
export const lookupWordService = async (word: string): Promise<DictionaryResult> => {
  const client = getClient();
  const model = client.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: dictionaryResultSchema,
    },
  });

  const prompt = `
    Act as a professional learner's dictionary specifically tailored for students preparing for **IELTS, TOEFL, and CET-6**.
    User Look-up Query: "${word}".
    
    **STEP 1: Normalization & Generalization (CRITICAL)**
    1. Analyze the user's input. Is it a specific instance of a phrasal verb or collocation with specific pronouns?
    2. If yes, convert it to the **Canonical Form** (Headword).
       - Input: "pop us back" -> Output: "pop sth back"
       - Input: "made up my mind" -> Output: "make up one's mind"
    
    **STEP 2: Filtering & Content Generation**
    1. **Target Audience**: Students preparing for exams (IELTS, TOEFL, CET-6) and daily communication.
    2. **Filtering Rule**: 
       - OMIT rare, archaic, obsolete, or highly technical scientific definitions unless the word itself is technical.
       - Focus ONLY on the most common 3-4 meanings used in modern English and exams.
    3. **COCA Frequency per Part of Speech**:
       - For each part of speech (e.g. Noun vs Verb), estimate its specific COCA frequency rank.
       - Example: "address" might be "Rank 1029" as a Noun, but "Rank 1816" as a Verb.
       - Provide a concise string like "Rank 1029" or "Top 2000".

    **STEP 3: Structure**
    - Definitions: Clear, simple English explanation + Concise Chinese meaning.
    - Examples: Must be natural, modern, and relevant to exam contexts or daily life.
    
    **STEP 4: Collocations & Fixed Phrases**
    - Identify 3-5 high-frequency collocations, idioms, or fixed phrases containing this word.
    - Prioritize phrases useful for IELTS/TOEFL writing or speaking.
    - Provide meaning and a sentence example for each.

    Structure the response by Part of Speech (POS).
    Return strictly JSON.
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text) as DictionaryResult;
  } catch (error) {
    console.error('Dictionary API Error:', error);
    throw new Error('无法查询该单词，请重试。');
  }
};

// --- 写作评估服务 ---
export const evaluateWritingService = async (text: string, mode: WritingMode): Promise<WritingResult> => {
  const client = getClient();
  const model = client.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: writingResultSchema,
    },
  });

  const modeInstructions = `
    **MODE: BASIC CORRECTION (基础纠错)**
    - Target: General accuracy.
    - Task: Focus STRICTLY on correcting grammar, spelling, punctuation, and serious awkwardness.
    - Do NOT change style, tone, or vocabulary unless it is incorrect.
    - Keep the output very close to the original, only fixing errors.
  `;

  const prompt = `
    Act as a professional English Editor and IELTS Examiner.
    
    ${modeInstructions}

    **Task**:
    Analyze the user's text and reconstruct it into the *Improved Version* according to the selected mode.
    You must return the result as a sequence of SEGMENTS that allow us to reconstruct the full text while highlighting exactly what changed.

    **Input Text**: "${text}"

    **Output Logic**:
    - Iterate through the improved text.
    - If a part of the text is the same as original, mark it as 'unchanged'.
    - If you changed, added, or removed something, create a segment of type 'change'.
      - 'text': The NEW/IMPROVED text.
      - 'original': The ORIGINAL text that was replaced (or empty string if added).
      - 'reason': A brief explanation in Chinese.
      - 'category': One of 'grammar', 'vocabulary', 'style', 'punctuation', 'collocation' | 'punctuation'.
    - **CRITICAL - PARAGRAPH PRESERVATION**: 
      - You MUST preserve all paragraph breaks and newlines (\\n) from the original text exactly as they are.
      - When you encounter a newline in the original text, return it as a separate segment: { "text": "\\n", "type": "unchanged" }.
      - Do NOT merge paragraphs.
    
    **Example**:
    Original: "I go store.\\n\\nIt was fun."
    Improved: "I went to the store.\\n\\nIt was fun."
    Segments:
    [
      { "text": "I ", "type": "unchanged" },
      { "text": "went", "original": "go", "type": "change", "reason": "Past tense", "category": "grammar" },
      { "text": " to the ", "original": "", "type": "change", "reason": "Preposition", "category": "grammar" },
      { "text": "store.", "type": "unchanged" },
      { "text": "\\n\\n", "type": "unchanged" },
      { "text": "It was fun.", "type": "unchanged" }
    ]

    Return strictly JSON.
  `;

  try {
    const result = await model.generateContent(prompt);
    const textResult = result.response.text();
    const parsed = JSON.parse(textResult) as WritingResult;
    parsed.mode = mode;
    return parsed;
  } catch (error) {
    console.error('Writing Evaluation API Error:', error);
    throw new Error('写作分析失败，请检查网络或稍后再试。');
  }
};

// --- 聊天服务 ---
export const getChatResponseService = async (
  history: Message[],
  contextContent: string | null,
  userMessage: string,
  contextType: 'sentence' | 'word' | 'writing' = 'sentence'
): Promise<string> => {
  const client = getClient();

  let contextInstruction = '';
  if (contextType === 'sentence') {
    contextInstruction = `**当前正在分析的句子**: "${contextContent || '用户暂未输入句子'}"。`;
  } else if (contextType === 'word') {
    contextInstruction = `**当前正在查询的单词/词组**: "${contextContent || '用户暂未查询单词'}"。`;
  } else if (contextType === 'writing') {
    contextInstruction = `**当前正在润色的文章**: "${contextContent || '用户暂未输入文章'}"。`;
  }

  const systemInstruction = `
    你是一个热情、专业的英语学习助教。
    
    ${contextInstruction}
    
    **你的任务**：
    1. 解答用户关于英语语法、单词用法、句子结构或词汇辨析的问题。
    2. **始终使用中文**回答。
    3. 使用 **Markdown** 格式来美化你的回答，使其清晰易读：
       - 使用 **加粗** 来强调重点单词或语法术语。
       - 使用列表（1. 或 -）来分点解释。
       - 适当分段。
    4. 语气要鼓励、积极，像一位耐心的老师。
    5. **特殊指令**：如果用户询问类似 "pop us back" 这样的短语，请解释这是一种口语表达，核心是短语动词 "pop back" (迅速回去)，"us" 是宾语。
  `;

  const model = client.getGenerativeModel({
    model: 'gemini-2.5-flash-lite',
    systemInstruction: systemInstruction,
  });

  // Build chat history
  const chatHistory = history.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));

  try {
    const chat = model.startChat({ history: chatHistory as any });
    const result = await chat.sendMessage(userMessage);
    return result.response.text();
  } catch (error) {
    console.error('Chat API Error:', error);
    throw new Error('聊天服务暂时不可用。');
  }
};
