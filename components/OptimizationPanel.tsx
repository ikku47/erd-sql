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
      case 'High': return 'bg-black text-white';
      case 'Medium': return 'bg-gray-500 text-white';
      case 'Low': return 'bg-gray-200 text-black border border-black';
      default: return 'bg-white text-black border border-black';
    }
  };

  if (optimizations.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center">
        <Database size={48} strokeWidth={1} className="mb-4" />
        <p>No optimizations generated yet. Analyze a SQL file to see suggestions.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4 bg-neutral-50">
      {optimizations.map((opt) => (
        <div key={opt.id} className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <span className="p-1 border border-black bg-neutral-100">
                {getIcon(opt.category)}
              </span>
              <span className="font-bold uppercase text-sm tracking-wide">{opt.category}</span>
            </div>
            <span className={`text-[10px] uppercase font-bold px-2 py-1 ${getImpactColor(opt.impact)}`}>
              {opt.impact} Impact
            </span>
          </div>
          
          <h3 className="font-bold text-lg mb-2">{opt.title}</h3>
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">{opt.description}</p>
          
          {opt.sqlCode && (
            <div className="mt-2">
              <div className="text-xs font-bold mb-1 uppercase text-gray-500">Suggested Query:</div>
              <div className="border-2 border-black overflow-hidden">
                <SyntaxHighlighter
                  language="sql"
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    padding: '12px',
                    fontSize: '12px',
                    borderRadius: 0,
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