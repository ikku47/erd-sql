<div align="center">
  <img width="1200" height="630" alt="MonoSQL Cover" src="./cover.png" />
</div>

# MonoSQL: AI-Powered ERD Generator

A developer-focused, monochrome ERD generator that visualizes SQL dumps and provides AI-driven database optimization suggestions. Transform your SQL schemas into beautiful entity-relationship diagrams with intelligent analysis.

## Features

- 🎨 **Visual ERD Generation**: Automatically generate entity-relationship diagrams from SQL dumps
- 🤖 **AI-Powered Analysis**: Get intelligent optimization suggestions using Google Gemini AI
- 📊 **Interactive Diagrams**: Explore your database schema with an interactive React Flow diagram
- 🔍 **Optimization Insights**: Receive categorized suggestions for Performance, Security, Normalization, and Storage improvements
- 💾 **Persistent Storage**: Your work is automatically saved to localStorage
- 📥 **Export Functionality**: Export your ERD diagrams as PNG images
- 🎯 **Developer-Focused**: Clean, monochrome UI designed for developers

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **React Flow** - Interactive diagram visualization
- **Google Gemini AI** - Schema analysis and optimization suggestions
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **Vite** - Build tool and dev server

## Prerequisites

- **Node.js** (v18 or higher)
- **Bun** (recommended) or npm
- **Google Gemini API Key** - Get yours from [Google AI Studio](https://makersuite.google.com/app/apikey)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd erd-sql
   ```

2. Install dependencies:
   ```bash
   bun install
   # or
   npm install
   ```

3. Set up your environment variables:
   Create a `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

## Usage

1. Start the development server:
   ```bash
   bun run dev
   # or
   npm run dev
   ```

2. Open your browser to `http://localhost:3000`

3. Paste your SQL dump into the editor on the left

4. Click "Analyze" to generate your ERD diagram

5. Explore the generated diagram and review AI optimization suggestions in the "AI Optimization Report" tab

## Project Structure

```
erd-sql/
├── components/          # React components
│   ├── AnalysisOverlay.tsx
│   ├── OptimizationPanel.tsx
│   ├── SqlEditor.tsx
│   └── TableNode.tsx
├── services/            # API services
│   └── geminiService.ts
├── store/               # State management
│   └── useAppStore.ts
├── utils/               # Utility functions
│   └── layout.ts
├── public/              # Static assets
│   ├── logo.svg
│   └── cover.png
└── App.tsx             # Main application component
```

## Building for Production

```bash
bun run build
# or
npm run build
```

The production build will be in the `dist/` directory.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
