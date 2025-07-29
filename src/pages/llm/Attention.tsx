import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as d3 from 'd3';
import { Eye, Play, Pause, RotateCcw, Layers, Target, Shuffle } from 'lucide-react';
import VisualizationBase from '../../components/VisualizationBase';

interface ChartDimensions {
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  innerWidth: number;
  innerHeight: number;
}

interface AttentionWeight {
  from: number;
  to: number;
  weight: number;
  head: number;
}

interface Token {
  text: string;
  position: number;
  embedding: number[];
}

const Attention = () => {
  const [inputText, setInputText] = useState("The cat sat on the mat");
  const [tokens, setTokens] = useState<Token[]>([]);
  const [attentionWeights, setAttentionWeights] = useState<AttentionWeight[]>([]);
  const [numHeads, setNumHeads] = useState(4);
  const [selectedHead, setSelectedHead] = useState(0);
  const [selectedToken, setSelectedToken] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const [attentionType, setAttentionType] = useState<'self' | 'cross'>('self');

  const animationRef = useRef<number | null>(null);
  const svgRef = useRef<d3.Selection<SVGSVGElement, unknown, null, undefined> | null>(null);
  const dimensionsRef = useRef<ChartDimensions | null>(null);

  // Tokenize input text
  const tokenizeText = (text: string): Token[] => {
    const words = text.toLowerCase().split(/\s+/);
    return words.map((word, index) => ({
      text: word,
      position: index,
      embedding: Array.from({ length: 8 }, () => Math.random() * 2 - 1) // Random embeddings for demo
    }));
  };

  // Generate attention weights using simplified attention mechanism
  const generateAttentionWeights = (tokens: Token[], heads: number): AttentionWeight[] => {
    const weights: AttentionWeight[] = [];
    const seqLength = tokens.length;

    for (let head = 0; head < heads; head++) {
      for (let i = 0; i < seqLength; i++) {
        for (let j = 0; j < seqLength; j++) {
          // Simulate different attention patterns for different heads
          let weight = 0;

          switch (head % 4) {
            case 0: // Local attention - focus on nearby tokens
              weight = Math.exp(-Math.abs(i - j) * 0.5) + Math.random() * 0.1;
              break;
            case 1: // Positional attention - focus on specific positions
              weight = Math.exp(-Math.abs(j - seqLength/2) * 0.3) + Math.random() * 0.1;
              break;
            case 2: // Content-based attention - simulate semantic similarity
              const similarity = tokens[i].embedding.reduce((sum, val, idx) =>
                sum + val * tokens[j].embedding[idx], 0) / 8;
              weight = Math.max(0, similarity + 0.5) + Math.random() * 0.1;
              break;
            case 3: // Global attention - more uniform distribution
              weight = 0.5 + Math.random() * 0.5;
              break;
          }

          weights.push({
            from: i,
            to: j,
            weight: Math.max(0.01, weight),
            head
          });
        }
      }
    }

    // Normalize weights for each head and position
    for (let head = 0; head < heads; head++) {
      for (let i = 0; i < seqLength; i++) {
        const headWeights = weights.filter(w => w.head === head && w.from === i);
        const sum = headWeights.reduce((s, w) => s + w.weight, 0);
        headWeights.forEach(w => w.weight /= sum);
      }
    }

    return weights;
  };

  // Get attention weights for specific head and token
  const getAttentionForToken = (tokenIndex: number, head: number): AttentionWeight[] => {
    return attentionWeights.filter(w => w.from === tokenIndex && w.head === head);
  };

  // Animation step
  const animateAttention = () => {
    if (!isAnimating) return;

    setAnimationStep(prev => (prev + 1) % tokens.length);

    setTimeout(() => {
      animationRef.current = requestAnimationFrame(animateAttention);
    }, 1500);
  };

  // Control functions
  const toggleAnimation = () => {
    setIsAnimating(!isAnimating);
  };

  const reset = () => {
    setIsAnimating(false);
    setAnimationStep(0);
    setSelectedToken(null);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const generateNewWeights = () => {
    const newWeights = generateAttentionWeights(tokens, numHeads);
    setAttentionWeights(newWeights);
  };

  // Initialize tokens and weights when text changes
  useEffect(() => {
    const newTokens = tokenizeText(inputText);
    setTokens(newTokens);
    const newWeights = generateAttentionWeights(newTokens, numHeads);
    setAttentionWeights(newWeights);
    setSelectedToken(null);
    setAnimationStep(0);
  }, [inputText, numHeads]);

  // Handle animation
  useEffect(() => {
    if (isAnimating) {
      animationRef.current = requestAnimationFrame(animateAttention);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnimating, tokens.length]);

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
    if (!svgRef.current || !dimensionsRef.current || tokens.length === 0) return;

    const svg = svgRef.current;
    const dimensions = dimensionsRef.current;

    svg.selectAll("*").remove();

    const chartGroup = svg
      .append('g')
      .attr('transform', `translate(${dimensions.margin.left},${dimensions.margin.top})`);

    // Create sections for tokens and attention heatmap
    const tokenHeight = 60;
    const heatmapHeight = dimensions.innerHeight - tokenHeight - 100;
    const tokenWidth = dimensions.innerWidth / tokens.length;

    // Draw tokens
    const tokenGroup = chartGroup.append('g').attr('class', 'tokens');

    tokens.forEach((token, i) => {
      const isSelected = selectedToken === i || (isAnimating && animationStep === i);

      tokenGroup
        .append('rect')
        .attr('x', i * tokenWidth)
        .attr('y', 0)
        .attr('width', tokenWidth - 2)
        .attr('height', tokenHeight)
        .attr('rx', 8)
        .attr('fill', isSelected ? '#ffd700' : '#667eea')
        .attr('stroke', '#333')
        .attr('stroke-width', isSelected ? 3 : 1)
        .style('cursor', 'pointer')
        .on('click', () => setSelectedToken(i));

      tokenGroup
        .append('text')
        .attr('x', i * tokenWidth + tokenWidth / 2)
        .attr('y', tokenHeight / 2 + 5)
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .attr('font-weight', 'bold')
        .attr('font-size', '14px')
        .text(token.text)
        .style('cursor', 'pointer')
        .on('click', () => setSelectedToken(i));

      // Position label
      tokenGroup
        .append('text')
        .attr('x', i * tokenWidth + tokenWidth / 2)
        .attr('y', tokenHeight + 15)
        .attr('text-anchor', 'middle')
        .attr('fill', '#666')
        .attr('font-size', '10px')
        .text(`Pos ${i}`);
    });

    // Draw attention heatmap
    const heatmapGroup = chartGroup
      .append('g')
      .attr('class', 'heatmap')
      .attr('transform', `translate(0, ${tokenHeight + 30})`);

    const cellWidth = dimensions.innerWidth / tokens.length;
    const cellHeight = heatmapHeight / tokens.length;

    // Color scale for attention weights
    const colorScale = d3.scaleSequential(d3.interpolateBlues)
      .domain([0, 1]);

    // Draw heatmap cells
    tokens.forEach((fromToken, i) => {
      tokens.forEach((toToken, j) => {
        const weight = attentionWeights.find(w =>
          w.from === i && w.to === j && w.head === selectedHead
        )?.weight || 0;

        const isHighlighted = selectedToken === i || (isAnimating && animationStep === i);

        heatmapGroup
          .append('rect')
          .attr('x', j * cellWidth)
          .attr('y', i * cellHeight)
          .attr('width', cellWidth - 1)
          .attr('height', cellHeight - 1)
          .attr('fill', colorScale(weight))
          .attr('stroke', isHighlighted && i === selectedToken ? '#ffd700' : '#fff')
          .attr('stroke-width', isHighlighted && i === selectedToken ? 3 : 1)
          .attr('opacity', isHighlighted ? 1 : 0.8);

        // Add weight text for significant weights
        if (weight > 0.1) {
          heatmapGroup
            .append('text')
            .attr('x', j * cellWidth + cellWidth / 2)
            .attr('y', i * cellHeight + cellHeight / 2 + 4)
            .attr('text-anchor', 'middle')
            .attr('fill', weight > 0.5 ? 'white' : 'black')
            .attr('font-size', '10px')
            .attr('font-weight', 'bold')
            .text(weight.toFixed(2));
        }
      });
    });

    // Add axis labels for heatmap
    heatmapGroup
      .append('text')
      .attr('x', dimensions.innerWidth / 2)
      .attr('y', heatmapHeight + 25)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text('To Token (Key)');

    heatmapGroup
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -heatmapHeight / 2)
      .attr('y', -15)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text('From Token (Query)');

    // Add attention flow arrows for selected token
    if (selectedToken !== null || isAnimating) {
      const sourceToken = isAnimating ? animationStep : selectedToken!;
      const sourceWeights = getAttentionForToken(sourceToken, selectedHead);

      const arrowGroup = chartGroup.append('g').attr('class', 'arrows');

      sourceWeights.forEach(weight => {
        if (weight.weight > 0.05) { // Only show significant connections
          const fromX = sourceToken * tokenWidth + tokenWidth / 2;
          const toX = weight.to * tokenWidth + tokenWidth / 2;
          const fromY = tokenHeight;
          const toY = 0;

          // Create curved arrow
          const path = d3.path();
          path.moveTo(fromX, fromY);
          path.quadraticCurveTo(
            (fromX + toX) / 2,
            fromY + 40 + weight.weight * 30,
            toX,
            toY
          );

          arrowGroup
            .append('path')
            .attr('d', path.toString())
            .attr('stroke', '#ff6b6b')
            .attr('stroke-width', weight.weight * 8 + 1)
            .attr('fill', 'none')
            .attr('opacity', 0.7)
            .attr('marker-end', 'url(#arrowhead)');
        }
      });

      // Add arrowhead marker
      svg.append('defs')
        .append('marker')
        .attr('id', 'arrowhead')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 8)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', '#ff6b6b');
    }

    // Add color legend
    const legendGroup = chartGroup
      .append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${dimensions.innerWidth - 150}, ${tokenHeight + 50})`);

    const legendScale = d3.scaleLinear()
      .domain([0, 1])
      .range([0, 100]);

    const legendAxis = d3.axisRight(legendScale)
      .ticks(5)
      .tickFormat(d3.format('.1f'));

    // Create gradient for legend
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'legend-gradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0).attr('y1', 100)
      .attr('x2', 0).attr('y2', 0);

    gradient.selectAll('stop')
      .data(d3.range(0, 1.1, 0.1))
      .enter().append('stop')
      .attr('offset', d => d * 100 + '%')
      .attr('stop-color', d => colorScale(d));

    legendGroup
      .append('rect')
      .attr('width', 20)
      .attr('height', 100)
      .style('fill', 'url(#legend-gradient)');

    legendGroup
      .append('g')
      .attr('transform', 'translate(20, 0)')
      .call(legendAxis);

    legendGroup
      .append('text')
      .attr('x', 10)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text('Attention Weight');
  };

  useEffect(() => {
    updateVisualization();
  }, [tokens, attentionWeights, selectedHead, selectedToken, animationStep, isAnimating]);

  const controls = (
    <>
      <div className="controls-grid">
        <div className="control-group">
          <label>Input Text</label>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="text-input"
            placeholder="Enter text to analyze attention..."
          />
        </div>

        <div className="control-group">
          <label>Number of Heads: {numHeads}</label>
          <input
            type="range"
            min="1"
            max="8"
            value={numHeads}
            onChange={(e) => setNumHeads(parseInt(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label>Selected Head: {selectedHead + 1}</label>
          <input
            type="range"
            min="0"
            max={numHeads - 1}
            value={selectedHead}
            onChange={(e) => setSelectedHead(parseInt(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label>Attention Type</label>
          <select
            value={attentionType}
            onChange={(e) => setAttentionType(e.target.value as any)}
            className="select-input"
          >
            <option value="self">Self-Attention</option>
            <option value="cross">Cross-Attention</option>
          </select>
        </div>
      </div>

      <div className="button-group">
        <button
          className={`btn ${isAnimating ? 'btn-secondary' : 'btn-primary'}`}
          onClick={toggleAnimation}
          disabled={tokens.length === 0}
        >
          {isAnimating ? <Pause size={16} /> : <Play size={16} />}
          {isAnimating ? 'Pause' : 'Animate'} Attention
        </button>

        <button className="btn btn-secondary" onClick={reset}>
          <RotateCcw size={16} />
          Reset
        </button>

        <button className="btn btn-secondary" onClick={generateNewWeights}>
          <Shuffle size={16} />
          Regenerate Weights
        </button>
      </div>
    </>
  );

  const stats = [
    { label: 'Tokens', value: tokens.length, icon: <Target size={16} /> },
    { label: 'Attention Heads', value: numHeads, icon: <Layers size={16} /> },
    { label: 'Selected Token', value: selectedToken !== null ? tokens[selectedToken]?.text || 'None' : 'None', icon: <Eye size={16} /> },
    { label: 'Max Attention', value: selectedToken !== null ? Math.max(...getAttentionForToken(selectedToken, selectedHead).map(w => w.weight)).toFixed(3) : 'N/A', icon: <Target size={16} /> }
  ];

  return (
    <VisualizationBase
      title="Attention Mechanism Visualizer"
      description="Explore how attention mechanisms help models focus on relevant parts of the input"
      controls={controls}
      stats={stats}
      onVisualizationReady={handleVisualizationReady}
      width={900}
      height={700}
    >
      <style>{`
        .text-input {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          font-size: 0.9rem;
        }

        .select-input {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          font-size: 0.9rem;
          background: white;
        }
      `}</style>
    </VisualizationBase>
  );
};

export default Attention;
