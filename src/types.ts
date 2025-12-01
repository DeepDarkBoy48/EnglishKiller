export interface AnalysisChunk {
  text: string;
  grammarDescription: string;
  partOfSpeech: string;
  role: string;
}

export interface DetailedToken {
  text: string;
  partOfSpeech: string;
  role: string;
  explanation: string;
  meaning: string;
}

export interface CorrectionChange {
  type: 'add' | 'remove' | 'keep';
  text: string;
}

export interface Correction {
  original: string;
  corrected: string;
  errorType: string;
  reason: string;
  changes: CorrectionChange[];
}

export interface AnalysisResult {
  chunks: AnalysisChunk[];
  detailedTokens: DetailedToken[];
  chineseTranslation: string;
  englishSentence: string;
  correction?: Correction;
  sentencePattern?: string;
  mainTense?: string;
}

// --- Dictionary Types ---

export interface DictionaryDefinition {
  meaning: string;
  explanation: string;
  example: string;
  exampleTranslation: string;
}

export interface DictionaryCollocation {
  phrase: string;
  meaning: string;
  example: string;
  exampleTranslation: string;
}

export interface DictionaryEntry {
  partOfSpeech: string;
  cocaFrequency?: string;
  definitions: DictionaryDefinition[];
}

export interface DictionaryResult {
  word: string;
  phonetic: string;
  entries: DictionaryEntry[];
  collocations?: DictionaryCollocation[];
}

// --- Writing Analysis Types ---

export type WritingMode = 'fix';

export interface WritingSegment {
  type: 'unchanged' | 'change';
  text: string;
  original?: string;
  reason?: string;
  category?: 'grammar' | 'vocabulary' | 'style' | 'collocation' | 'punctuation';
}

export interface WritingResult {
  mode: WritingMode;
  generalFeedback: string;
  segments: WritingSegment[];
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// --- Page Mode ---
export type PageMode = 'writing' | 'reading';
