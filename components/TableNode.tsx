import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { TableNodeData } from '../types';
import { Key, Link, Columns } from 'lucide-react';

const TableNode = ({ data }: { data: TableNodeData }) => {
  return (
    <div className="bg-[#252526] border border-[#3e3e42] min-w-[250px]">
      {/* Header */}
      <div className="bg-[#007acc] text-white p-2 font-semibold border-b border-[#3e3e42] flex items-center justify-between font-mono">
        <span className="text-sm truncate">{data.label}</span>
        <Columns size={12} />
      </div>

      {/* Columns */}
      <div className="p-0">
        {data.columns.map((col, index) => (
          <div 
            key={index} 
            className="flex items-center justify-between p-2 border-b border-[#3e3e42] last:border-b-0 hover:bg-[#2a2d2e] transition-colors text-sm group font-mono"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-[#cccccc] group-hover:text-white transition-colors text-xs">
                {col.name}
              </span>
              {col.isPk && <Key size={10} className="text-[#4ec9b0] fill-current" />}
              {col.isFk && <Link size={10} className="text-[#569cd6]" />}
            </div>
            <span className="text-xs text-[#858585] ml-4">{col.type}</span>
            
            {/* Handles for connections - simplified to left/right for now */}
            <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-[#007acc] !border-0" style={{ left: -5, top: '50%' }} />
            <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-[#007acc] !border-0" style={{ right: -5, top: '50%' }} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default memo(TableNode);