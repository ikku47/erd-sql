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
        style: { stroke: '#000', strokeWidth: 2 },
        labelStyle: { fill: '#000', fontWeight: 700, fontFamily: 'monospace' },
        labelBgStyle: { fill: '#fff', fillOpacity: 0.8 },
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

    toPng(reactFlowWrapper.current, { cacheBust: true, backgroundColor: '#ffffff' })
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
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-white text-black font-mono">
      {/* Header */}
      <header className="flex justify-between items-center p-4 border-b-2 border-black bg-white z-10">
        <div className="flex items-center gap-3">
          <div className="bg-black text-white p-2">
            <LayoutDashboard size={24} />
          </div>
          <h1 className="text-2xl font-bold tracking-tighter uppercase">MonoSQL</h1>
        </div>
        <div className="text-xs font-bold text-gray-500 uppercase hidden md:block">
          AI-Powered ERD Generator
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: SQL Input */}
        <div className="w-1/3 min-w-[350px] max-w-[600px] h-full z-10">
          <SqlEditor 
            sql={sql} 
            setSql={setSql} 
            onAnalyze={onAnalyze} 
            isAnalyzing={isAnalyzing} 
          />
        </div>

        {/* Right Panel: Visualization & Report */}
        <div className="flex-1 flex flex-col h-full relative bg-neutral-100">
          
          {/* Tabs */}
          <div className="flex border-b-2 border-black bg-white">
            <button
              onClick={() => setActiveTab('diagram')}
              className={`px-6 py-3 font-bold uppercase text-sm flex items-center gap-2 border-r border-black hover:bg-neutral-100 transition-colors
                ${activeTab === 'diagram' ? 'bg-black text-white' : 'bg-white text-black'}
              `}
            >
              <LayoutDashboard size={16} /> Diagram
            </button>
            <button
              onClick={() => setActiveTab('optimizations')}
              className={`px-6 py-3 font-bold uppercase text-sm flex items-center gap-2 border-r border-black hover:bg-neutral-100 transition-colors
                ${activeTab === 'optimizations' ? 'bg-black text-white' : 'bg-white text-black'}
              `}
            >
              <BrainCircuit size={16} /> AI Optimization Report
              {analysisResult && (
                <span className="ml-1 bg-white text-black text-[10px] px-1.5 rounded-none border border-black">
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
                    <Background color="#000" gap={20} size={1} />
                    <Controls 
                      className="!bg-white !border-2 !border-black !shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" 
                      showInteractive={false} 
                    />
                    <Panel position="top-right">
                       <button 
                        onClick={onExport}
                        className="bg-white border-2 border-black px-4 py-2 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center gap-2 uppercase text-xs"
                      >
                        <Download size={14} /> Export PNG
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