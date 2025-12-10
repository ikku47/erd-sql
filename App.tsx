import React, { useState, useCallback, useMemo, useRef } from 'react';
import ReactFlow, { 
  Node, 
  Edge, 
  Background, 
  Controls, 
  ConnectionMode,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  Panel
} from 'reactflow';
// import 'reactflow/dist/style.css'; // Removed: Loaded via index.html to prevent ESM import error
import { toPng } from 'html-to-image';
import { Download, LayoutDashboard, BrainCircuit, Maximize } from 'lucide-react';

import SqlEditor from './components/SqlEditor';
import OptimizationPanel from './components/OptimizationPanel';
import TableNode from './components/TableNode';
import { analyzeSqlDump } from './services/geminiService';
import { getLayoutedElements } from './utils/layout';
import { AnalysisResult } from './types';

// Define custom node types
const nodeTypes = {
  table: TableNode,
};

function App() {
  const [sql, setSql] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'diagram' | 'optimizations'>('diagram');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const onAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeSqlDump(sql);
      setAnalysisResult(result);
      
      // Transform schema to React Flow nodes/edges
      const flowNodes: Node[] = result.schema.tables.map((table, idx) => ({
        id: table.name,
        type: 'table',
        data: { label: table.name, columns: table.columns },
        position: { x: 0, y: 0 }, // Initial pos, will be layouted
      }));

      const flowEdges: Edge[] = result.schema.relationships.map((rel, idx) => ({
        id: `e-${idx}`,
        source: rel.sourceTable,
        target: rel.targetTable,
        label: rel.type,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#007acc', strokeWidth: 2 },
        labelStyle: { fill: '#cccccc', fontWeight: 600, fontFamily: "'Consolas', 'Courier New', 'Monaco', 'Menlo', monospace" },
        labelBgStyle: { fill: '#1e1e1e', fillOpacity: 0.9 },
      }));

      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(flowNodes, flowEdges);

      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
      setActiveTab('diagram');

    } catch (error) {
      console.error("Analysis failed", error);
      alert("Failed to analyze SQL. Please check the API key and file content.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const onExport = useCallback(() => {
    if (reactFlowWrapper.current === null) {
      return;
    }

    toPng(reactFlowWrapper.current, { cacheBust: true, backgroundColor: '#1e1e1e' })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'monosql-erd.png';
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error("Failed to export", err);
      });
  }, [reactFlowWrapper]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#1e1e1e] text-[#cccccc] font-mono">
      {/* Header */}
      <header className="flex justify-between items-center p-3 border-b border-[#3e3e42] bg-[#252526] z-10">
        <div className="flex items-center gap-3">
          <div className="bg-[#007acc] text-white p-2">
            <LayoutDashboard size={20} />
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-[#cccccc]">MonoSQL</h1>
        </div>
        <div className="text-xs text-[#858585] hidden md:block">
          AI-Powered ERD Generator
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: SQL Input */}
        <div className="w-1/3 min-w-[350px] max-w-[600px] h-full z-10 border-r border-[#3e3e42]">
          <SqlEditor 
            sql={sql} 
            setSql={setSql} 
            onAnalyze={onAnalyze} 
            isAnalyzing={isAnalyzing} 
          />
        </div>

        {/* Right Panel: Visualization & Report */}
        <div className="flex-1 flex flex-col h-full relative bg-[#1e1e1e]">
          
          {/* Tabs */}
          <div className="flex border-b border-[#3e3e42] bg-[#252526]">
            <button
              onClick={() => setActiveTab('diagram')}
              className={`px-4 py-2 text-sm flex items-center gap-2 border-r border-[#3e3e42] transition-colors font-mono
                ${activeTab === 'diagram' ? 'bg-[#1e1e1e] text-[#cccccc] border-b-2 border-[#007acc]' : 'bg-[#252526] text-[#858585] hover:bg-[#2a2d2e]'}
              `}
            >
              <LayoutDashboard size={14} /> Diagram
            </button>
            <button
              onClick={() => setActiveTab('optimizations')}
              className={`px-4 py-2 text-sm flex items-center gap-2 border-r border-[#3e3e42] transition-colors font-mono
                ${activeTab === 'optimizations' ? 'bg-[#1e1e1e] text-[#cccccc] border-b-2 border-[#007acc]' : 'bg-[#252526] text-[#858585] hover:bg-[#2a2d2e]'}
              `}
            >
              <BrainCircuit size={14} /> AI Optimization Report
              {analysisResult && (
                <span className="ml-1 bg-[#007acc] text-white text-[10px] px-1.5 border-0">
                  {analysisResult.optimizations.length}
                </span>
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 relative overflow-hidden">
            {activeTab === 'diagram' ? (
              <div className="h-full w-full" ref={reactFlowWrapper}>
                 <ReactFlowProvider>
                  <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    connectionMode={ConnectionMode.Loose}
                    fitView
                    attributionPosition="bottom-right"
                  >
                    <Background color="#2d2d30" gap={20} size={1} />
                    <Controls 
                      className="!bg-[#252526] !border !border-[#3e3e42]" 
                      showInteractive={false} 
                    />
                    <Panel position="top-right">
                       <button 
                        onClick={onExport}
                        className="bg-[#0e639c] hover:bg-[#1177bb] text-white px-3 py-1.5 text-xs flex items-center gap-2 border-0 transition-colors font-mono"
                      >
                        <Download size={12} /> Export PNG
                      </button>
                    </Panel>
                  </ReactFlow>
                </ReactFlowProvider>
              </div>
            ) : (
              <OptimizationPanel optimizations={analysisResult?.optimizations || []} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;