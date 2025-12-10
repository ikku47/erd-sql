import dagre from 'dagre';
import { Position, type Node, type Edge } from 'reactflow';

const nodeWidth = 280;
const nodeHeight = 200; // Average height estimate

export const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'LR') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    // Dynamically estimate height based on column count if available in data
    const height = node.data.columns ? (node.data.columns.length * 30) + 50 : nodeHeight;
    dagreGraph.setNode(node.id, { width: nodeWidth, height: height });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    
    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches React Flow's anchor point (top left).
    return {
      ...node,
      targetPosition: direction === 'LR' ? Position.Left : Position.Top,
      sourcePosition: direction === 'LR' ? Position.Right : Position.Bottom,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - (node.data.columns ? ((node.data.columns.length * 30) + 50) : nodeHeight) / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};