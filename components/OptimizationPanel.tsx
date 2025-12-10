import React, { useState } from 'react';
import { OptimizationSuggestion } from '../types';
import { AlertTriangle, Zap, Shield, Database, Archive, Copy, Check } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface OptimizationPanelProps {
  optimizations: OptimizationSuggestion[];
}

const OptimizationPanel: React.FC<OptimizationPanelProps> = ({ optimizations }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getIcon = (category: string) => {
    switch (category) {
      case 'Performance': return <Zap size={16} />;
      case 'Security': return <Shield size={16} />;
      case 'Normalization': return <Database size={16} />;
      case 'Storage': return <Archive size={16} />;
      default: return <AlertTriangle size={16} />;
    }
  };


  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return 'bg-[#f48771] text-white';
      case 'Medium': return 'bg-[#cea262] text-white';
      case 'Low': return 'bg-[#89d185] text-[#1e1e1e]';
      default: return 'bg-[#3e3e42] text-[#cccccc]';
    }
  };

  if (optimizations.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-[#858585] p-8 text-center font-mono">
        <Database size={48} strokeWidth={1} className="mb-4 text-[#6a6a6a]" />
        <p className="text-sm">No optimizations generated yet. Analyze a SQL file to see suggestions.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-3 bg-[#1e1e1e]">
      {optimizations.map((opt) => (
        <div key={opt.id} className="bg-[#252526] border border-[#3e3e42] p-4">
          <div className="flex justify-between items-start mb-3 gap-2">
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="p-1.5 border border-[#3e3e42] bg-[#1e1e1e] text-[#cccccc] flex-shrink-0">
                {getIcon(opt.category)}
              </span>
              <span className="font-semibold text-sm text-[#cccccc] font-mono whitespace-nowrap">{opt.category}</span>
            </div>
            <span className={`text-[10px] font-semibold px-2 py-1 border-0 font-mono whitespace-nowrap flex-shrink-0 ${getImpactColor(opt.impact)}`}>
              {opt.impact} Impact
            </span>
          </div>
          
          <h3 className="font-semibold text-base mb-2 text-[#cccccc] font-mono break-words">{opt.title}</h3>
          <p className="text-sm text-[#858585] mb-4 leading-relaxed font-mono break-words whitespace-pre-wrap">{opt.description}</p>
          
          {opt.sqlCode && (
            <div className="mt-3">
              <div className="flex justify-between items-center mb-1.5">
                <div className="text-xs font-semibold text-[#858585] font-mono">Suggested Query:</div>
                <button
                  onClick={() => handleCopy(opt.sqlCode!, opt.id)}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-[#0e639c] hover:bg-[#1177bb] text-white border-0 transition-colors font-mono"
                  title="Copy SQL code"
                >
                  {copiedId === opt.id ? (
                    <>
                      <Check size={12} /> Copied
                    </>
                  ) : (
                    <>
                      <Copy size={12} /> Copy
                    </>
                  )}
                </button>
              </div>
              <div className="border border-[#3e3e42] overflow-x-auto">
                <SyntaxHighlighter
                  language="sql"
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    padding: '12px',
                    fontSize: '12px',
                    borderRadius: 0,
                    fontFamily: "'Consolas', 'Courier New', 'Monaco', 'Menlo', monospace",
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                  }}
                  showLineNumbers={false}
                  wrapLines={true}
                  wrapLongLines={true}
                >
                  {opt.sqlCode}
                </SyntaxHighlighter>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default OptimizationPanel;