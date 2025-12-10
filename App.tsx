import React, { useCallback, useRef, useEffect } from 'react';
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
import { Download, LayoutDashboard, BrainCircuit, Maximize, Github } from 'lucide-react';

import SqlEditor from './components/SqlEditor';
import OptimizationPanel from './components/OptimizationPanel';
import TableNode from './components/TableNode';
import AnalysisOverlay from './components/AnalysisOverlay';
import { analyzeSqlDump } from './services/geminiService';
import { getLayoutedElements } from './utils/layout';
import { useAppStore } from './store/useAppStore';

// Define custom node types
const nodeTypes = {
  table: TableNode,
};

function App() {
  // Zustand store
  const {
    sql,
    setSql,
    analysisResult,
    setAnalysisResult,
    nodes: storeNodes,
    edges: storeEdges,
    setNodes: setStoreNodes,
    setEdges: setStoreEdges,
    activeTab,
    setActiveTab,
    isAnalyzing,
    setIsAnalyzing,
    analysisStage,
    setAnalysisStage,
  } = useAppStore();

  // React Flow state - initialize from store
  const [nodes, setNodes, onNodesChange] = useNodesState(storeNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(storeEdges);

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useRef<any>(null);
  const hasInitialized = useRef(false);

  // Initialize React Flow state from store when store has data (handles hydration from localStorage)
  useEffect(() => {
    if (!hasInitialized.current && (storeNodes.length > 0 || storeEdges.length > 0)) {
      setNodes(storeNodes);
      setEdges(storeEdges);
      hasInitialized.current = true;
    }
  }, [storeNodes, storeEdges, setNodes, setEdges]);

  // Sync store with React Flow state when nodes/edges change (debounced to avoid too many writes)
  useEffect(() => {
    if (!hasInitialized.current) return;
    const timeoutId = setTimeout(() => {
      setStoreNodes(nodes);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [nodes, setStoreNodes]);

  useEffect(() => {
    if (!hasInitialized.current) return;
    const timeoutId = setTimeout(() => {
      setStoreEdges(edges);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [edges, setStoreEdges]);

  // Fit view when nodes are restored from storage
  useEffect(() => {
    if (nodes.length > 0 && reactFlowInstance.current) {
      setTimeout(() => {
        if (reactFlowInstance.current) {
          reactFlowInstance.current.fitView({ padding: 0.2, includeHiddenNodes: false });
        }
      }, 100);
    }
  }, [nodes.length]);

  const onNodesInit = useCallback((instance: any) => {
    reactFlowInstance.current = instance;
    // Fit view if we have nodes from storage
    if (nodes.length > 0) {
      setTimeout(() => {
        instance.fitView({ padding: 0.2, includeHiddenNodes: false });
      }, 100);
    }
  }, [nodes.length]);

  const onAnalyze = async () => {
    setIsAnalyzing(true);
    setActiveTab('diagram'); // Switch to diagram tab to show overlay
    
    try {
      // Stage 1: Processing SQL
      setAnalysisStage('processing');
      await new Promise(resolve => setTimeout(resolve, 300)); // Brief delay for visual feedback
      
      // Stage 2: Analyzing schema
      setAnalysisStage('analyzing');
      const result = await analyzeSqlDump(sql);
      
      // Stage 3: Generating diagram
      setAnalysisStage('generating');
      await new Promise(resolve => setTimeout(resolve, 200));
      
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

      // Stage 4: Optimizing layout
      setAnalysisStage('optimizing');
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(flowNodes, flowEdges);

      // Stage 5: Finalizing
      setAnalysisStage('finalizing');
      await new Promise(resolve => setTimeout(resolve, 300));

      // Update both React Flow state and store
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
      setStoreNodes(layoutedNodes);
      setStoreEdges(layoutedEdges);
      hasInitialized.current = true; // Mark that we've initialized
      
      // Fit view after nodes are set, with padding to ensure all nodes are visible
      setTimeout(() => {
        if (reactFlowInstance.current) {
          reactFlowInstance.current.fitView({ padding: 0.2, includeHiddenNodes: false });
        }
      }, 100);

    } catch (error) {
      console.error("Analysis failed", error);
      alert("Failed to analyze SQL. Please check the API key and file content.");
    } finally {
      setIsAnalyzing(false);
      setAnalysisStage(null);
    }
  };

  const onExport = useCallback(() => {
    if (reactFlowWrapper.current === null || reactFlowInstance.current === null) {
      return;
    }

    // Fit view before export to ensure all nodes are visible
    reactFlowInstance.current.fitView({ padding: 0.2, includeHiddenNodes: false });
    
    // Wait for fitView to complete, then export
    setTimeout(() => {
      if (reactFlowWrapper.current) {
        toPng(reactFlowWrapper.current, { 
          cacheBust: true, 
          backgroundColor: '#1e1e1e',
          filter: (node) => {
            // Exclude ReactFlow controls and attribution
            if (node.classList?.contains('react-flow__controls')) return false;
            if (node.classList?.contains('react-flow__attribution')) return false;
            return true;
          }
        })
          .then((dataUrl) => {
            const link = document.createElement('a');
            link.download = 'monosql-erd.png';
            link.href = dataUrl;
            link.click();
          })
          .catch((err) => {
            console.error("Failed to export", err);
          });
      }
    }, 300);
  }, [reactFlowWrapper]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#1e1e1e] text-[#cccccc] font-mono">
      {/* Header */}
      <header className="flex justify-between items-center p-3 border-b border-[#3e3e42] bg-[#252526] z-10">
        <div className="flex items-center gap-3">
          <div className="bg-[#007acc] text-white p-2">
            <LayoutDashboard size={20} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold tracking-tight text-[#cccccc]">MonoSQL</h1>
            <span className="text-[10px] text-[#858585] font-mono">open source</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs text-[#858585] hidden md:block">
            AI-Powered ERD Generator
          </div>
          <a
            href="https://github.com/ikku47/erd-sql"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 text-[#cccccc] hover:text-white hover:bg-[#3e3e42] transition-colors border border-[#3e3e42] hover:border-[#007acc]"
            title="Star on GitHub"
          >
            <Github size={18} />
            <span className="text-xs font-mono hidden sm:inline">Star</span>
          </a>
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
              className={`px-4 py-2 text-sm flex items-center gap-2 border-r border-[#3e3e42] transition-colors font-mono relative
                ${activeTab === 'diagram' ? 'bg-[#1e1e1e] text-[#cccccc] border-b-2 border-[#007acc]' : 'bg-[#252526] text-[#858585] hover:bg-[#2a2d2e]'}
              `}
            >
              <LayoutDashboard size={14} /> Diagram
              {isAnalyzing && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="ml-1 animate-spin">
                  <circle
                    cx="6"
                    cy="6"
                    r="4"
                    fill="none"
                    stroke="#007acc"
                    strokeWidth="1.5"
                    strokeDasharray="12"
                    strokeDashoffset="6"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </button>
            <button
              onClick={() => setActiveTab('optimizations')}
              className={`px-4 py-2 text-sm flex items-center gap-2 border-r border-[#3e3e42] transition-colors font-mono relative
                ${activeTab === 'optimizations' ? 'bg-[#1e1e1e] text-[#cccccc] border-b-2 border-[#007acc]' : 'bg-[#252526] text-[#858585] hover:bg-[#2a2d2e]'}
              `}
            >
              <BrainCircuit size={14} /> AI Optimization Report
              {isAnalyzing && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="ml-1 animate-spin">
                  <circle
                    cx="6"
                    cy="6"
                    r="4"
                    fill="none"
                    stroke="#007acc"
                    strokeWidth="1.5"
                    strokeDasharray="12"
                    strokeDashoffset="6"
                    strokeLinecap="round"
                  />
                </svg>
              )}
              {analysisResult && !isAnalyzing && (
                <span className="ml-1 bg-[#007acc] text-white text-[10px] px-1.5 border-0">
                  {analysisResult.optimizations.length}
                </span>
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 relative overflow-hidden">
            {activeTab === 'diagram' ? (
              <div className="h-full w-full relative" ref={reactFlowWrapper}>
                 <ReactFlowProvider>
                  <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onInit={onNodesInit}
                    nodeTypes={nodeTypes}
                    connectionMode={ConnectionMode.Loose}
                    minZoom={0.01}
                    maxZoom={4}
                    fitView
                    fitViewOptions={{ padding: 0.2 }}
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
                <AnalysisOverlay stage={analysisStage} />
              </div>
            ) : (
              <OptimizationPanel 
                optimizations={analysisResult?.optimizations || []} 
                isAnalyzing={isAnalyzing}
                analysisStage={analysisStage}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;