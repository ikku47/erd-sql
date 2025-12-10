import React from 'react';
import { FileCode, Upload, Play } from 'lucide-react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-sql';
import 'prismjs/themes/prism-tomorrow.css';

interface SqlEditorProps {
  sql: string;
  setSql: (sql: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

const SqlEditor: React.FC<SqlEditorProps> = ({ sql, setSql, onAnalyze, isAnalyzing }) => {
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSql(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] border-r border-[#3e3e42]">
      <div className="p-3 border-b border-[#3e3e42] flex justify-between items-center bg-[#252526]">
        <div className="flex items-center gap-2">
          <FileCode size={16} className="text-[#cccccc]" />
          <h2 className="text-sm font-semibold text-[#cccccc] font-mono">SQL Input</h2>
        </div>
        <div className="flex gap-2">
           <label className="cursor-pointer flex items-center gap-1.5 px-2 py-1 text-xs text-[#858585] hover:text-[#cccccc] hover:bg-[#2a2d2e] transition-colors border-0 font-mono">
            <Upload size={12} />
            Load File
            <input type="file" className="hidden" accept=".sql,.txt" onChange={handleFileUpload} />
          </label>
        </div>
      </div>
      
      <div className="flex-1 relative overflow-auto bg-[#1e1e1e]">
        <Editor
          value={sql}
          onValueChange={setSql}
          highlight={(code) => highlight(code, languages.sql, 'sql')}
          padding={12}
          placeholder="Paste your SQL dump here or upload a file..."
          style={{
            fontFamily: "'Consolas', 'Courier New', 'Monaco', 'Menlo', monospace",
            fontSize: 13,
            minHeight: '100%',
            width: '100%',
            outline: 'none',
            background: '#1e1e1e',
            color: '#cccccc',
          }}
          textareaClassName="outline-none w-full h-full resize-none bg-transparent text-[#cccccc] placeholder:text-[#6a6a6a]"
          preClassName="m-0"
        />
      </div>

      <div className="p-3 border-t border-[#3e3e42] bg-[#252526]">
        <button
          onClick={onAnalyze}
          disabled={!sql.trim() || isAnalyzing}
          className={`w-full flex items-center justify-center gap-2 p-2 text-xs font-mono transition-colors border-0
            ${!sql.trim() || isAnalyzing 
              ? 'opacity-50 cursor-not-allowed bg-[#2d2d30] text-[#6a6a6a]' 
              : 'bg-[#0e639c] hover:bg-[#1177bb] text-white'}
          `}
        >
          {isAnalyzing ? (
            <span className="animate-pulse">Analyzing...</span>
          ) : (
            <>
              <Play size={12} /> Generate Diagram & Report
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SqlEditor;