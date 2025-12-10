import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Node, Edge } from 'reactflow';
import type { AnalysisResult } from '../types';

interface AppState {
  // SQL content
  sql: string;
  setSql: (sql: string) => void;

  // Analysis result
  analysisResult: AnalysisResult | null;
  setAnalysisResult: (result: AnalysisResult | null) => void;

  // React Flow nodes and edges
  nodes: Node[];
  edges: Edge[];
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;

  // UI state
  activeTab: 'diagram' | 'optimizations';
  setActiveTab: (tab: 'diagram' | 'optimizations') => void;

  // Analysis state
  isAnalyzing: boolean;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  analysisStage: string | null;
  setAnalysisStage: (stage: string | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // SQL content
      sql: '',
      setSql: (sql: string) => set({ sql }),

      // Analysis result
      analysisResult: null,
      setAnalysisResult: (result: AnalysisResult | null) => set({ analysisResult: result }),

      // React Flow nodes and edges
      nodes: [],
      edges: [],
      setNodes: (nodes: Node[]) => set({ nodes }),
      setEdges: (edges: Edge[]) => set({ edges }),

      // UI state
      activeTab: 'diagram',
      setActiveTab: (tab: 'diagram' | 'optimizations') => set({ activeTab: tab }),

      // Analysis state (not persisted)
      isAnalyzing: false,
      setIsAnalyzing: (isAnalyzing: boolean) => set({ isAnalyzing }),
      analysisStage: null,
      setAnalysisStage: (stage: string | null) => set({ analysisStage: stage }),
    }),
    {
      name: 'monosql-storage',
      partialize: (state) => ({
        // Only persist these fields, exclude isAnalyzing
        sql: state.sql,
        analysisResult: state.analysisResult,
        nodes: state.nodes,
        edges: state.edges,
        activeTab: state.activeTab,
      }),
    }
  )
);

