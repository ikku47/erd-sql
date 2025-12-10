import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { TableNodeData } from '../types';
import { Key, Link, Columns } from 'lucide-react';

const TableNode = ({ data }: { data: TableNodeData }) => {
  return (
    <div className="bg-white border-2 border-black min-w-[250px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      {/* Header */}
      <div className="bg-black text-white p-2 font-bold border-b-2 border-black flex items-center justify-between">
        <span className="uppercase tracking-wider truncate">{data.label}</span>
        <Columns size={14} />
      </div>

      {/* Columns */}
      <div className="p-0">
        {data.columns.map((col, index) => (
          <div 
            key={index} 
            className="flex items-center justify-between p-2 border-b border-black last:border-b-0 hover:bg-neutral-100 transition-colors text-sm group"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-black group-hover:font-bold transition-all">
                {col.name}
              </span>
              {col.isPk && <Key size={12} className="text-black fill-current" />}
              {col.isFk && <Link size={12} className="text-gray-500" />}
            </div>
            <span className="text-xs text-gray-500 font-mono ml-4">{col.type}</span>
            
            {/* Handles for connections - simplified to left/right for now */}
            <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-black !rounded-none !border-0" style={{ left: -5, top: '50%' }} />
            <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-black !rounded-none !border-0" style={{ right: -5, top: '50%' }} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default memo(TableNode);