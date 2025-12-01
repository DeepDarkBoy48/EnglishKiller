# SmashEnglish - AI 英语学习助手

一个纯前端的 AI 驱动英语学习工具，直接在浏览器中调用 Google Gemini API。

## 功能特性

- **句法分析器** - 输入英语句子，AI 自动解析主谓宾定状补结构
- **AI 智能词典** - 深度解析单词含义、词性搭配及地道例句
- **写作润色** - 智能纠正语法错误，支持文章精读模式
- **AI 对话助手** - 随时向 AI 提问英语相关问题

## 技术栈

- React 18 + TypeScript
- Vite 6
- Tailwind CSS 4
- Google Generative AI SDK (`@google/generative-ai`)
- Lucide React Icons

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

### 3. 配置 API Key

首次使用时，应用会提示你输入 Gemini API Key。

**获取 API Key：**
1. 访问 [Google AI Studio](https://aistudio.google.com/apikey)
2. 登录 Google 账号
3. 创建新的 API Key
4. 复制 API Key 并粘贴到应用中

> **安全提示：** API Key 仅存储在浏览器的 localStorage 中，不会发送到任何服务器。

## 生产构建

```bash
npm run build
```

构建产物位于 `dist` 目录，可以直接部署到任何静态托管服务。

## 项目结构

```
smash-english-standalone/
├── src/
│   ├── components/          # React 组件
│   │   ├── ApiKeySettings.tsx   # API Key 设置弹窗
│   │   ├── Header.tsx           # 导航栏
│   │   ├── InputArea.tsx        # 句子输入区
│   │   ├── ResultDisplay.tsx    # 分析结果展示
│   │   ├── DictionaryPage.tsx   # 词典页面
│   │   ├── WritingPage.tsx      # 写作润色页面
│   │   ├── AiAssistant.tsx      # AI 对话助手
│   │   └── Footer.tsx           # 页脚
│   ├── services/
│   │   └── geminiService.ts # Gemini API 服务
│   ├── types.ts             # TypeScript 类型定义
│   ├── App.tsx              # 主应用组件
│   ├── main.tsx             # 入口文件
│   └── index.css            # 全局样式
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 使用说明

### 句法分析

1. 在首页输入英语句子
2. 点击「分析」按钮
3. 查看句子的语法结构可视化和逐词详解

### 词典查询

1. 切换到「词典」标签
2. 输入单词或词组
3. 查看详细释义、例句和常用搭配

### 写作润色

1. 切换到「写作」标签
2. 粘贴或输入英语文章
3. 选择模式后点击「开始纠错」
4. 查看修改建议和原因

### AI 助手

点击右下角的「问问 AI」按钮，可以随时向 AI 提问英语相关问题。

## License

MIT
