import React from 'react';

interface AnalysisOverlayProps {
  stage: string | null;
}

const AnalysisOverlay: React.FC<AnalysisOverlayProps> = ({ stage }) => {
  if (!stage) return null;

  const stages = [
    { 
      id: 'processing', 
      label: 'Parsing SQL statements',
      description: null
    },
    { 
      id: 'analyzing', 
      label: 'Extracting schema relationships',
      description: 'Please be patient, this may take some time'
    },
    { 
      id: 'generating', 
      label: 'Building visual diagram',
      description: null
    },
    { 
      id: 'optimizing', 
      label: 'Discovering optimization opportunities',
      description: null
    },
    { 
      id: 'finalizing', 
      label: 'Preparing final results',
      description: null
    },
  ];

  const getCurrentStageIndex = () => {
    return stages.findIndex(s => s.id === stage);
  };

  const currentIndex = getCurrentStageIndex();

  const CheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
      <circle cx="8" cy="8" r="8" fill="#007acc" />
      <path
        d="M5 8 L7 10 L11 6"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const SpinnerIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 animate-spin">
      <circle
        cx="8"
        cy="8"
        r="6"
        fill="none"
        stroke="#007acc"
        strokeWidth="2"
        strokeDasharray="20"
        strokeDashoffset="10"
        strokeLinecap="round"
      />
    </svg>
  );

  const EmptyIcon = () => (
    <div className="w-4 h-4 flex-shrink-0 border-2 border-[#3e3e42] bg-[#1e1e1e]" />
  );

  return (
    <div className="absolute inset-0 bg-[#1e1e1e]/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-[#252526] border border-[#3e3e42] shadow-lg p-6 min-w-[320px]">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-[#858585] font-mono uppercase tracking-wider">
            Analysis Progress
          </h3>
        </div>
        <div className="flex flex-col gap-3">
          {stages.map((stageItem, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isPending = index > currentIndex;

            return (
              <div
                key={stageItem.id}
                className={`flex items-center gap-3 py-2 px-2 transition-all duration-300 ${
                  isCurrent ? 'bg-[#1e1e1e] border-l-2 border-[#007acc] pl-3' : ''
                }`}
              >
                <div className="flex items-center justify-center w-4 h-4">
                  {isCompleted && <CheckIcon />}
                  {isCurrent && <SpinnerIcon />}
                  {isPending && <EmptyIcon />}
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <span
                    className={`font-mono text-sm ${
                      isCompleted
                        ? 'text-[#858585] line-through'
                        : isCurrent
                        ? 'text-[#cccccc] font-semibold'
                        : 'text-[#3e3e42]'
                    }`}
                  >
                    {stageItem.label}
                  </span>
                  {isCurrent && stageItem.description && (
                    <span className="text-xs text-[#858585] font-mono italic">
                      {stageItem.description}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AnalysisOverlay;

