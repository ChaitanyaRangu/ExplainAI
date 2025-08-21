import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { TreeNode } from '../utils/decisionTree';

type Props = {
  rootNode: TreeNode | null;
  width?: number | string;
  height?: number | string;
  highlightNodeId?: number | null;
  onNodeClick?: (nodeId: number) => void;
};

// Simple D3 tree renderer that consumes the TreeNode structure and builds a tidy tree layout
export default function DecisionTreeViz({ rootNode, width = '100%', height = 500, highlightNodeId, onNodeClick }: Props) {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!rootNode) return;
    const svg = d3.select(ref.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 90, bottom: 30, left: 90 };
    const w = (typeof width === 'number') ? width : (ref.current?.parentElement?.clientWidth ?? 800);
    const h = (typeof height === 'number') ? height : (ref.current?.parentElement?.clientHeight ?? 500);
    const innerW = (w as number) - margin.left - margin.right;
    const innerH = (h as number) - margin.top - margin.bottom;

    const g = svg
      .attr('width', w)
      .attr('height', h)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Convert our TreeNode into d3.hierarchy
    function toD3(node: TreeNode): any {
      const children = [] as any[];
      if (node.left) children.push(toD3(node.left));
      if (node.right) children.push(toD3(node.right));
      return { ...node, children };
    }

    const root = d3.hierarchy(toD3(rootNode));

    const treeLayout = d3.tree().size([innerW, innerH]);
    treeLayout(root as any);

    // Links
    g.selectAll('.link')
      .data((root as any).links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('fill', 'none')
      .attr('stroke', 'rgba(255,255,255,0.14)')
      .attr('stroke-width', 1.5)
      .attr('d', function (d: any) {
        return 'M' + d.source.x + ',' + d.source.y
          + 'V' + ((d.source.y + d.target.y) / 2)
          + 'H' + d.target.x
          + 'V' + d.target.y;
      });

    // Nodes
    const nodeG = g.selectAll('.node')
      .data((root as any).descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d: any) => `translate(${d.x},${d.y})`)
      .style('cursor', 'pointer')
      .on('click', (event: any, d: any) => {
        onNodeClick && onNodeClick(d.data.id);
      });

    nodeG.append('circle')
      .attr('r', 22)
      .attr('fill', (d: any) => d.data.id === highlightNodeId ? '#ffb547' : 'rgba(255,255,255,0.06)')
      .attr('stroke', 'rgba(255,255,255,0.18)')
      .attr('stroke-width', 1.5);

    nodeG.append('text')
      .attr('dy', -30)
      .attr('text-anchor', 'middle')
      .style('font-size', 12)
      .style('fill', '#e6eef8')
      .text((d: any) => `#${d.data.id}`);

    nodeG.append('text')
      .attr('dy', 4)
      .attr('text-anchor', 'middle')
      .style('font-size', 12)
      .style('fill', '#cbd5e1')
      .text((d: any) => d.data.prediction || '');

    nodeG.append('text')
      .attr('dy', 18)
      .attr('text-anchor', 'middle')
      .style('font-size', 11)
      .style('fill', '#9fb0c8')
      .text((d: any) => (d.data.featureIndex !== undefined ? `f${d.data.featureIndex} <= ${d.data.threshold}` : 'leaf'));

  }, [rootNode, width, height, highlightNodeId, onNodeClick]);

  return (
    <div style={{ width: width, height: height }}>
      <svg ref={ref}></svg>
    </div>
  );
}
