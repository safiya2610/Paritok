<div align="center">
<p align="center">
 <img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/082898d5-b731-4d0d-818d-1df89a7231db" />
</p>
# Paritok: Build Smarter with Token-Efficient AI 

[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.17-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

 AI-Powered GitHub Repository Explorer & PR Reviewer | Understand codebases instantly with AI-driven insights

[Features](#features) • [Architecture & APIs](#architecture--apis) • [Installation](#installation) • [Usage](#usage)

</div>

## Features

- **AI Context Optimizer**: Intelligently removes duplicates, noise, and irrelevant files before sending data to the LLM using Paritok compression.
- **AI Codebase Chat Assistant**: Chat directly with any GitHub repository. Ask questions, explore logic, and get generated tests in an instant.
- **Automated PR Reviewer**: Paste a GitHub PR URL or Raw Diff and instantly receive an AI review summarizing Bugs, Security Issues, Performance Improvements, Code Smells, and an Overall Score.
- **Token Replay & Optimization Metrics**: See exactly how many tokens were saved, cost reduced, and latency improved when using Paritok compression.
- **Clean Minimalist UI**: Built with a sleek, structural, Vercel-inspired flat aesthetic.
- **Smart Context Selection**: Automatically drills down from hundreds of files to just the relevant few.

## 🏗 Architecture & APIs

Paritok leverages modern serverless architecture and advanced LLM APIs:

### Architecture
- **Frontend Layer (Client)**: Built on **Next.js 15 (App Router)** with **React 19**. Uses **Tailwind CSS** and **shadcn/ui** for a responsive, clean component library.
- **Backend Layer (API Routes)**: Next.js API Routes act as middleware. They handle request validation, API throttling (via Redis), and secure communication with external APIs.
- **Optimization Layer (Paritok)**: Our proprietary `lib/paritok.ts` module parses and compresses large code blocks and diffs, stripping out unnecessary whitespace, noise, and redundant files, achieving up to 74% token reduction before querying the AI.

### APIs Used
1. **GitHub REST API (`api.github.com`)**: 
   - Used to fetch raw repository file trees, individual file contents, and Pull Request diffs (`.diff` and `.patch` formats).
2. **Google Gemini API (`@google/generative-ai`)**:
   - Powers the conversational AI assistant and the PR Reviewer module.
   - Relies heavily on models like `gemini-3.5-flash` and `gemini-2.5-pro` for fast, intelligent code comprehension. 
   - Uses strict JSON structured prompting to guarantee parseable PR review outputs.

##  Installation

1. **Clone the repository**
```bash
git clone https://github.com/safiya2610/Paritok.git
cd Paritok
```

2. **Install dependencies**
```bash
npm install
# or
pnpm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory with the following variables:
```env
# Required: Your Google Gemini AI API Key
GEMINI_API_KEY=your_gemini_api_key

# Optional but Recommended: Fallback Gemini API Key
GEMINI_API_KEY_SECONDARY=your_secondary_gemini_api_key

# Optional: GitHub Token to avoid rate limits when fetching repos and PRs
GITHUB_TOKEN=your_github_token
```

## Usage

1. **Start the development server**
```bash
npm run dev
```

2. **Open your browser**
Navigate to `http://localhost:3000`

### Repo Analyzer
- Select the **Repo Analyzer** tab on the home page.
- Enter any GitHub username/repository name (e.g. `vercel/next.js`).
- Chat with the codebase, explore the file tree, and read file contents using the built-in file explorer!

### PR Reviewer
- Select the **PR Reviewer** tab on the home page.
- Paste a GitHub Pull Request URL (e.g. `https://github.com/facebook/react/pull/1000`) or a raw git diff.
- Toggle **Use Paritok Optimization** to save tokens.
- Instantly review identified Bugs, Security Risks, Performance Improvements, and Code Smells!


---

<div align="center">
Made with ❤️
</div>
