import React from 'react';
import { OptimizationSuggestion } from '../types';
import { AlertTriangle, Zap, Shield, Database, Archive } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface OptimizationPanelProps {
  optimizations: OptimizationSuggestion[];
}

const OptimizationPanel: React.FC<OptimizationPanelProps> = ({ optimizations }) => {
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
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 border border-[#3e3e42] bg-[#1e1e1e] text-[#cccccc]">
                {getIcon(opt.category)}
              </span>
              <span className="font-semibold text-sm text-[#cccccc] font-mono">{opt.category}</span>
            </div>
            <span className={`text-[10px] font-semibold px-2 py-1 border-0 font-mono ${getImpactColor(opt.impact)}`}>
              {opt.impact} Impact
            </span>
          </div>
          
          <h3 className="font-semibold text-base mb-2 text-[#cccccc] font-mono">{opt.title}</h3>
          <p className="text-sm text-[#858585] mb-4 leading-relaxed font-mono">{opt.description}</p>
          
          {opt.sqlCode && (
            <div className="mt-2">
              <div className="text-xs font-semibold mb-1.5 text-[#858585] font-mono">Suggested Query:</div>
              <div className="border border-[#3e3e42] overflow-hidden">
                <SyntaxHighlighter
                  language="sql"
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    padding: '12px',
                    fontSize: '12px',
                    borderRadius: 0,
                    fontFamily: "'Consolas', 'Courier New', 'Monaco', 'Menlo', monospace",
                  }}
                  showLineNumbers={false}
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