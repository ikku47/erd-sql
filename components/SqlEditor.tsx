import React from 'react';
import { FileCode, Upload, Play } from 'lucide-react';

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
    <div className="flex flex-col h-full bg-white border-r-2 border-black">
      <div className="p-4 border-b-2 border-black flex justify-between items-center bg-neutral-50">
        <div className="flex items-center gap-2">
          <FileCode size={20} />
          <h2 className="font-bold uppercase tracking-wider">SQL Input</h2>
        </div>
        <div className="flex gap-2">
           <label className="cursor-pointer flex items-center gap-2 px-3 py-1 text-xs font-bold border-2 border-black hover:bg-black hover:text-white transition-colors">
            <Upload size={14} />
            LOAD FILE
            <input type="file" className="hidden" accept=".sql,.txt" onChange={handleFileUpload} />
          </label>
        </div>
      </div>
      
      <div className="flex-1 relative">
        <textarea
          className="w-full h-full p-4 font-mono text-sm resize-none focus:outline-none"
          placeholder="Paste your SQL dump here or upload a file..."
          value={sql}
          onChange={(e) => setSql(e.target.value)}
          spellCheck={false}
        />
      </div>

      <div className="p-4 border-t-2 border-black bg-neutral-50">
        <button
          onClick={onAnalyze}
          disabled={!sql.trim() || isAnalyzing}
          className={`w-full flex items-center justify-center gap-2 p-3 font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all
            ${!sql.trim() || isAnalyzing ? 'opacity-50 cursor-not-allowed bg-gray-200' : 'bg-white hover:bg-black hover:text-white'}
          `}
        >
          {isAnalyzing ? (
            <span className="animate-pulse">ANALYZING...</span>
          ) : (
            <>
              <Play size={16} /> GENERATE DIAGRAM & REPORT
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SqlEditor;