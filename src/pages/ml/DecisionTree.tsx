import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as d3 from 'd3';
import { Play, Pause, RotateCcw, GitBranch, Target, Shuffle, Plus } from 'lucide-react';
import VisualizationBase from '../../components/VisualizationBase';
import { colorSchemes } from '../../utils/d3-helpers';

interface ChartDimensions {
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  innerWidth: number;
  innerHeight: number;
}

interface DataPoint {
  x: number;
  y: number;
  label: 'A' | 'B';
  id: number;
}

interface TreeNode {
  id: string;
  feature: 'x' | 'y' | null;
  threshold: number | null;
  prediction: 'A' | 'B' | null;
  left: TreeNode | null;
  right: TreeNode | null;
  depth: number;
  samples: DataPoint[];
  gini: number;
  x: number;
  y: number;
}

const DecisionTree = () => {
  const [data, setData] = useState<DataPoint[]>([]);
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [maxDepth, setMaxDepth] = useState(3);
  const [minSamples, setMinSamples] = useState(5);
  const [isBuilding, setIsBuilding] = useState(false);
  const [currentNode, setCurrentNode] = useState<string | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<DataPoint | null>(null);
  const [predictionPath, setPredictionPath] = useState<string[]>([]);

  const animationRef = useRef<number | null>(null);
  const svgRef = useRef<d3.Selection<SVGSVGElement, unknown, null, undefined> | null>(null);
  const dimensionsRef = useRef<ChartDimensions | null>(null);

  // Generate sample data
  const generateData = () => {
    const newData: DataPoint[] = [];

    // Generate clusters for class A and B
    for (let i = 0; i < 50; i++) {
      // Class A - bottom left and top right
      if (Math.random() > 0.5) {
        newData.push({
          x: Math.random() * 4 + 1,
          y: Math.random() * 4 + 1,
          label: 'A',
          id: i
        });
      } else {
        newData.push({
          x: Math.random() * 4 + 6,
          y: Math.random() * 4 + 6,
          label: 'A',
          id: i
        });
      }
    }

    for (let i = 50; i < 100; i++) {
      // Class B - top left and bottom right
      if (Math.random() > 0.5) {
        newData.push({
          x: Math.random() * 4 + 1,
          y: Math.random() * 4 + 6,
          label: 'B',
          id: i
        });
      } else {
        newData.push({
          x: Math.random() * 4 + 6,
          y: Math.random() * 4 + 1,
          label: 'B',
          id: i
        });
      }
    }

    setData(newData);
    setTree(null);
    setCurrentNode(null);
    setPredictionPath([]);
  };

  // Calculate Gini impurity
  const calculateGini = (samples: DataPoint[]): number => {
    if (samples.length === 0) return 0;

    const labelCounts = samples.reduce((acc, sample) => {
      acc[sample.label] = (acc[sample.label] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = samples.length;
    let gini = 1;

    Object.values(labelCounts).forEach(count => {
      const probability = count / total;
      gini -= probability * probability;
    });

    return gini;
  };

  // Find best split
  const findBestSplit = (samples: DataPoint[]) => {
    let bestGini = Infinity;
    let bestFeature: 'x' | 'y' | null = null;
    let bestThreshold: number | null = null;
    let bestLeft: DataPoint[] = [];
    let bestRight: DataPoint[] = [];

    const features: ('x' | 'y')[] = ['x', 'y'];

    features.forEach(feature => {
      const values = samples.map(s => s[feature]).sort((a, b) => a - b);
      const uniqueValues = [...new Set(values)];

      for (let i = 0; i < uniqueValues.length - 1; i++) {
        const threshold = (uniqueValues[i] + uniqueValues[i + 1]) / 2;

        const left = samples.filter(s => s[feature] <= threshold);
        const right = samples.filter(s => s[feature] > threshold);

        if (left.length === 0 || right.length === 0) continue;

        const leftGini = calculateGini(left);
        const rightGini = calculateGini(right);
        const weightedGini = (left.length * leftGini + right.length * rightGini) / samples.length;

        if (weightedGini < bestGini) {
          bestGini = weightedGini;
          bestFeature = feature;
          bestThreshold = threshold;
          bestLeft = left;
          bestRight = right;
        }
      }
    });

    return { bestFeature, bestThreshold, bestLeft, bestRight, bestGini };
  };

  // Get majority class
  const getMajorityClass = (samples: DataPoint[]): 'A' | 'B' => {
    const counts = samples.reduce((acc, sample) => {
      acc[sample.label] = (acc[sample.label] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return counts['A'] > counts['B'] ? 'A' : 'B';
  };

  // Build decision tree recursively
  const buildTree = (
    samples: DataPoint[],
    depth: number = 0,
    nodeId: string = 'root'
  ): TreeNode => {
    const gini = calculateGini(samples);

    // Base cases
    if (depth >= maxDepth ||
        samples.length < minSamples ||
        gini === 0) {
      return {
        id: nodeId,
        feature: null,
        threshold: null,
        prediction: getMajorityClass(samples),
        left: null,
        right: null,
        depth,
        samples,
        gini,
        x: 0,
        y: 0
      };
    }

    const { bestFeature, bestThreshold, bestLeft, bestRight } = findBestSplit(samples);

    if (!bestFeature || !bestThreshold) {
      return {
        id: nodeId,
        feature: null,
        threshold: null,
        prediction: getMajorityClass(samples),
        left: null,
        right: null,
        depth,
        samples,
        gini,
        x: 0,
        y: 0
      };
    }

    const leftChild = buildTree(bestLeft, depth + 1, `${nodeId}-left`);
    const rightChild = buildTree(bestRight, depth + 1, `${nodeId}-right`);

    return {
      id: nodeId,
      feature: bestFeature,
      threshold: bestThreshold,
      prediction: null,
      left: leftChild,
      right: rightChild,
      depth,
      samples,
      gini,
      x: 0,
      y: 0
    };
  };

  // Calculate tree layout positions
  const calculateLayout = (node: TreeNode, x: number = 400, y: number = 50, width: number = 800): TreeNode => {
    node.x = x;
    node.y = y;

    if (node.left && node.right) {
      const childWidth = width / 2;
      node.left = calculateLayout(node.left, x - childWidth / 2, y + 80, childWidth);
      node.right = calculateLayout(node.right, x + childWidth / 2, y + 80, childWidth);
    }

    return node;
  };

  // Predict class for a point
  const predictPoint = (point: DataPoint, node: TreeNode): { prediction: 'A' | 'B', path: string[] } => {
    const path: string[] = [node.id];

    if (node.prediction) {
      return { prediction: node.prediction, path };
    }

    if (node.feature && node.threshold !== null) {
      if (point[node.feature] <= node.threshold) {
        if (node.left) {
          const result = predictPoint(point, node.left);
          return { prediction: result.prediction, path: [...path, ...result.path] };
        }
      } else {
        if (node.right) {
          const result = predictPoint(point, node.right);
          return { prediction: result.prediction, path: [...path, ...result.path] };
        }
      }
    }

    return { prediction: 'A', path };
  };

  // Animation for building tree
  const animateTreeBuilding = async () => {
    setIsBuilding(true);
    setCurrentNode(null);

    // Simulate step-by-step building
    const newTree = buildTree(data);
    const layoutTree = calculateLayout(newTree);

    // Animate node by node
    const nodes: TreeNode[] = [];
    const collectNodes = (node: TreeNode) => {
      nodes.push(node);
      if (node.left) collectNodes(node.left);
      if (node.right) collectNodes(node.right);
    };
    collectNodes(layoutTree);

    for (const node of nodes) {
      setCurrentNode(node.id);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    setTree(layoutTree);
    setCurrentNode(null);
    setIsBuilding(false);
  };

  // Control functions
  const buildTreeInstantly = () => {
    const newTree = buildTree(data);
    const layoutTree = calculateLayout(newTree);
    setTree(layoutTree);
    setCurrentNode(null);
  };

  const reset = () => {
    setTree(null);
    setCurrentNode(null);
    setSelectedPoint(null);
    setPredictionPath([]);
    setIsBuilding(false);
  };

  const handlePointClick = (point: DataPoint) => {
    setSelectedPoint(point);
    if (tree) {
      const result = predictPoint(point, tree);
      setPredictionPath(result.path);
    }
  };

  // Initialize data
  useEffect(() => {
    generateData();
  }, []);

  // Visualization setup
  const handleVisualizationReady = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    dimensions: ChartDimensions
  ) => {
    svgRef.current = svg;
    dimensionsRef.current = dimensions;
    updateVisualization();
  };

  const updateVisualization = () => {
    if (!svgRef.current || !dimensionsRef.current) return;

    const svg = svgRef.current;
    const dimensions = dimensionsRef.current;

    svg.selectAll("*").remove();

    // Create two main sections: data plot and tree
    const plotWidth = dimensions.innerWidth * 0.4;
    const treeWidth = dimensions.innerWidth * 0.6;

    // Data plot section
    const plotGroup = svg
      .append('g')
      .attr('transform', `translate(${dimensions.margin.left}, ${dimensions.margin.top})`);

    const xScale = d3.scaleLinear().domain([0, 10]).range([0, plotWidth]);
    const yScale = d3.scaleLinear().domain([0, 10]).range([plotWidth * 0.8, 0]);

    // Add axes for data plot
    plotGroup.append('g')
      .attr('transform', `translate(0, ${plotWidth * 0.8})`)
      .call(d3.axisBottom(xScale));

    plotGroup.append('g')
      .call(d3.axisLeft(yScale));

    // Add axis labels
    plotGroup.append('text')
      .attr('x', plotWidth / 2)
      .attr('y', plotWidth * 0.8 + 35)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Feature X');

    plotGroup.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -plotWidth * 0.4)
      .attr('y', -35)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('Feature Y');

    // Draw decision boundaries if tree exists
    if (tree) {
      const drawBoundaries = (node: TreeNode, xMin: number, xMax: number, yMin: number, yMax: number) => {
        if (node.feature && node.threshold !== null) {
          if (node.feature === 'x') {
            plotGroup.append('line')
              .attr('x1', xScale(node.threshold))
              .attr('y1', yScale(yMin))
              .attr('x2', xScale(node.threshold))
              .attr('y2', yScale(yMax))
              .attr('stroke', '#ff6b6b')
              .attr('stroke-width', 2)
              .attr('stroke-dasharray', '5,5')
              .attr('opacity', 0.7);

            if (node.left) drawBoundaries(node.left, xMin, node.threshold, yMin, yMax);
            if (node.right) drawBoundaries(node.right, node.threshold, xMax, yMin, yMax);
          } else {
            plotGroup.append('line')
              .attr('x1', xScale(xMin))
              .attr('y1', yScale(node.threshold))
              .attr('x2', xScale(xMax))
              .attr('y2', yScale(node.threshold))
              .attr('stroke', '#ff6b6b')
              .attr('stroke-width', 2)
              .attr('stroke-dasharray', '5,5')
              .attr('opacity', 0.7);

            if (node.left) drawBoundaries(node.left, xMin, xMax, yMin, node.threshold);
            if (node.right) drawBoundaries(node.right, xMin, xMax, node.threshold, yMax);
          }
        }
      };

      drawBoundaries(tree, 0, 10, 0, 10);
    }

    // Draw data points
    plotGroup.selectAll('.data-point')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'data-point')
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.y))
      .attr('r', d => selectedPoint?.id === d.id ? 8 : 5)
      .attr('fill', d => d.label === 'A' ? colorSchemes.primary : colorSchemes.error)
      .attr('stroke', d => selectedPoint?.id === d.id ? '#ffd700' : 'white')
      .attr('stroke-width', d => selectedPoint?.id === d.id ? 3 : 2)
      .style('cursor', 'pointer')
      .on('click', (event, d) => handlePointClick(d));

    // Tree visualization section
    if (tree) {
      const treeGroup = svg
        .append('g')
        .attr('transform', `translate(${dimensions.margin.left + plotWidth + 50}, ${dimensions.margin.top})`);

      // Draw tree nodes and edges
      const drawTree = (node: TreeNode) => {
        // Draw edges to children
        if (node.left) {
          treeGroup.append('line')
            .attr('x1', node.x - plotWidth - 50)
            .attr('y1', node.y)
            .attr('x2', node.left.x - plotWidth - 50)
            .attr('y2', node.left.y)
            .attr('stroke', '#666')
            .attr('stroke-width', 2);

          // Left edge label
          treeGroup.append('text')
            .attr('x', (node.x + node.left.x) / 2 - plotWidth - 50)
            .attr('y', (node.y + node.left.y) / 2 - 5)
            .attr('text-anchor', 'middle')
            .attr('font-size', '10px')
            .attr('fill', '#666')
            .text('≤');

          drawTree(node.left);
        }

        if (node.right) {
          treeGroup.append('line')
            .attr('x1', node.x - plotWidth - 50)
            .attr('y1', node.y)
            .attr('x2', node.right.x - plotWidth - 50)
            .attr('y2', node.right.y)
            .attr('stroke', '#666')
            .attr('stroke-width', 2);

          // Right edge label
          treeGroup.append('text')
            .attr('x', (node.x + node.right.x) / 2 - plotWidth - 50)
            .attr('y', (node.y + node.right.y) / 2 - 5)
            .attr('text-anchor', 'middle')
            .attr('font-size', '10px')
            .attr('fill', '#666')
            .text('>');

          drawTree(node.right);
        }

        // Draw node
        const isInPath = predictionPath.includes(node.id);
        const isCurrentNode = currentNode === node.id;

        treeGroup.append('rect')
          .attr('x', node.x - plotWidth - 50 - 40)
          .attr('y', node.y - 20)
          .attr('width', 80)
          .attr('height', 40)
          .attr('rx', 8)
          .attr('fill', isCurrentNode ? '#ffd700' : isInPath ? '#4ecdc4' : node.prediction ? colorSchemes.categorical[node.prediction === 'A' ? 0 : 1] : '#f8f9fa')
          .attr('stroke', '#333')
          .attr('stroke-width', isInPath ? 3 : 1);

        // Node text
        if (node.prediction) {
          treeGroup.append('text')
            .attr('x', node.x - plotWidth - 50)
            .attr('y', node.y - 5)
            .attr('text-anchor', 'middle')
            .attr('font-size', '12px')
            .attr('font-weight', 'bold')
            .attr('fill', 'white')
            .text(`Class ${node.prediction}`);

          treeGroup.append('text')
            .attr('x', node.x - plotWidth - 50)
            .attr('y', node.y + 8)
            .attr('text-anchor', 'middle')
            .attr('font-size', '10px')
            .attr('fill', 'white')
            .text(`(${node.samples.length})`);
        } else {
          treeGroup.append('text')
            .attr('x', node.x - plotWidth - 50)
            .attr('y', node.y - 5)
            .attr('text-anchor', 'middle')
            .attr('font-size', '10px')
            .attr('font-weight', 'bold')
            .attr('fill', '#333')
            .text(`${node.feature?.toUpperCase()} ≤ ${node.threshold?.toFixed(1)}`);

          treeGroup.append('text')
            .attr('x', node.x - plotWidth - 50)
            .attr('y', node.y + 8)
            .attr('text-anchor', 'middle')
            .attr('font-size', '9px')
            .attr('fill', '#666')
            .text(`Gini: ${node.gini.toFixed(3)}`);
        }
      };

      drawTree(tree);
    }
  };

  useEffect(() => {
    updateVisualization();
  }, [data, tree, currentNode, selectedPoint, predictionPath]);

  const controls = (
    <>
      <div className="controls-grid">
        <div className="control-group">
          <label>Max Depth: {maxDepth}</label>
          <input
            type="range"
            min="1"
            max="6"
            value={maxDepth}
            onChange={(e) => setMaxDepth(parseInt(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label>Min Samples per Split: {minSamples}</label>
          <input
            type="range"
            min="2"
            max="20"
            value={minSamples}
            onChange={(e) => setMinSamples(parseInt(e.target.value))}
          />
        </div>
      </div>

      <div className="button-group">
        <button
          className="btn btn-primary"
          onClick={animateTreeBuilding}
          disabled={isBuilding || data.length === 0}
        >
          {isBuilding ? <Pause size={16} /> : <Play size={16} />}
          {isBuilding ? 'Building...' : 'Animate Build'}
        </button>

        <button
          className="btn btn-secondary"
          onClick={buildTreeInstantly}
          disabled={isBuilding || data.length === 0}
        >
          <GitBranch size={16} />
          Build Instantly
        </button>

        <button className="btn btn-secondary" onClick={reset}>
          <RotateCcw size={16} />
          Reset Tree
        </button>

        <button className="btn btn-secondary" onClick={generateData}>
          <Shuffle size={16} />
          New Data
        </button>
      </div>
    </>
  );

  const stats = [
    { label: 'Tree Depth', value: tree ? tree.depth + 1 : 0, icon: <GitBranch size={16} /> },
    { label: 'Data Points', value: data.length, icon: <Target size={16} /> },
    { label: 'Selected Point', value: selectedPoint ? `(${selectedPoint.x.toFixed(1)}, ${selectedPoint.y.toFixed(1)})` : 'None', icon: <Plus size={16} /> },
    { label: 'Prediction', value: selectedPoint && tree ? predictPoint(selectedPoint, tree).prediction : 'N/A', icon: <Target size={16} /> }
  ];

  return (
    <VisualizationBase
      title="Decision Tree Visualizer"
      description="Build decision trees interactively and see how they split data to make predictions"
      controls={controls}
      stats={stats}
      onVisualizationReady={handleVisualizationReady}
      width={1000}
      height={600}
    />
  );
};

export default DecisionTree;
