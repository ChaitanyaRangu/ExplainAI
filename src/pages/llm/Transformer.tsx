import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as d3 from 'd3';
import { Play, Pause, RotateCcw, Layers, ArrowRight, Zap, Settings } from 'lucide-react';
import VisualizationBase from '../../components/VisualizationBase';
import { colorSchemes, ChartDimensions } from '../../utils/d3-helpers';

interface TransformerLayer {
  id: string;
  type: 'embedding' | 'encoder' | 'decoder' | 'output';
  name: string;
  components: string[];
  x: number;
  y: number;
  width: number;
  height: number;
  active: boolean;
}

interface DataFlow {
  from: string;
  to: string;
  data: number[];
  active: boolean;
}

const Transformer = () => {
  const [inputText, setInputText] = useState("Hello world");
  const [numLayers, setNumLayers] = useState(3);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [architecture, setArchitecture] = useState<'encoder-only' | 'decoder-only' | 'encoder-decoder'>('encoder-decoder');
  const [layers, setLayers] = useState<TransformerLayer[]>([]);
  const [dataFlows, setDataFlows] = useState<DataFlow[]>([]);
  const [showAttention, setShowAttention] = useState(true);
  const [showResidual, setShowResidual] = useState(true);

  const animationRef = useRef<number>();
  const svgRef = useRef<d3.Selection<SVGSVGElement, unknown, null, undefined>>();
  const dimensionsRef = useRef<ChartDimensions>();

  // Initialize transformer architecture
  const initializeArchitecture = () => {
    const newLayers: TransformerLayer[] = [];
    const layerWidth = 150;
    const layerHeight = 80;
    const spacing = 100;

    let yOffset = 50;

    // Input Embedding
    newLayers.push({
      id: 'embedding',
      type: 'embedding',
      name: 'Input Embedding',
      components: ['Token Embedding', 'Positional Encoding'],
      x: 50,
      y: yOffset,
      width: layerWidth,
      height: layerHeight,
      active: false
    });

    yOffset += layerHeight + spacing;

    // Encoder layers (if needed)
    if (architecture === 'encoder-only' || architecture === 'encoder-decoder') {
      for (let i = 0; i < numLayers; i++) {
        newLayers.push({
          id: `encoder-${i}`,
          type: 'encoder',
          name: `Encoder Layer ${i + 1}`,
          components: ['Multi-Head Attention', 'Layer Norm', 'Feed Forward', 'Layer Norm'],
          x: 50,
          y: yOffset,
          width: layerWidth,
          height: layerHeight,
          active: false
        });
        yOffset += layerHeight + spacing;
      }
    }

    // Decoder layers (if needed)
    if (architecture === 'decoder-only' || architecture === 'encoder-decoder') {
      for (let i = 0; i < numLayers; i++) {
        const components = architecture === 'encoder-decoder'
          ? ['Masked Self-Attention', 'Layer Norm', 'Cross-Attention', 'Layer Norm', 'Feed Forward', 'Layer Norm']
          : ['Masked Self-Attention', 'Layer Norm', 'Feed Forward', 'Layer Norm'];

        newLayers.push({
          id: `decoder-${i}`,
          type: 'decoder',
          name: `Decoder Layer ${i + 1}`,
          components,
          x: architecture === 'encoder-decoder' ? 250 : 50,
          y: architecture === 'encoder-decoder' ? 50 + (i + 1) * (layerHeight + spacing) : yOffset,
          width: layerWidth,
          height: layerHeight,
          active: false
        });

        if (architecture === 'decoder-only') {
          yOffset += layerHeight + spacing;
        }
      }
    }

    // Output layer
    const outputY = architecture === 'encoder-decoder'
      ? 50 + (numLayers + 1) * (layerHeight + spacing)
      : yOffset;

    newLayers.push({
      id: 'output',
      type: 'output',
      name: 'Output Layer',
      components: ['Linear', 'Softmax'],
      x: architecture === 'encoder-decoder' ? 250 : 50,
      y: outputY,
      width: layerWidth,
      height: layerHeight,
      active: false
    });

    setLayers(newLayers);

    // Initialize data flows
    const newDataFlows: DataFlow[] = [];
    for (let i = 0; i < newLayers.length - 1; i++) {
      newDataFlows.push({
        from: newLayers[i].id,
        to: newLayers[i + 1].id,
        data: Array.from({ length: 8 }, () => Math.random()),
        active: false
      });
    }

    // Add cross-attention flows for encoder-decoder
    if (architecture === 'encoder-decoder') {
      const encoderLayers = newLayers.filter(l => l.type === 'encoder');
      const decoderLayers = newLayers.filter(l => l.type === 'decoder');

      encoderLayers.forEach(encLayer => {
        decoderLayers.forEach(decLayer => {
          newDataFlows.push({
            from: encLayer.id,
            to: decLayer.id,
            data: Array.from({ length: 8 }, () => Math.random()),
            active: false
          });
        });
      });
    }

    setDataFlows(newDataFlows);
    setCurrentStep(0);
  };

  // Animation step
  const animateStep = () => {
    if (!isAnimating) return;

    // Reset all layers
    setLayers(prev => prev.map(layer => ({ ...layer, active: false })));
    setDataFlows(prev => prev.map(flow => ({ ...flow, active: false })));

    // Activate current layer
    setLayers(prev => prev.map((layer, index) => ({
      ...layer,
      active: index === currentStep
    })));

    // Activate relevant data flows
    setDataFlows(prev => prev.map(flow => {
      const fromIndex = layers.findIndex(l => l.id === flow.from);
      const toIndex = layers.findIndex(l => l.id === flow.to);
      return {
        ...flow,
        active: fromIndex === currentStep || toIndex === currentStep
      };
    }));

    setCurrentStep(prev => (prev + 1) % layers.length);

    setTimeout(() => {
      animationRef.current = requestAnimationFrame(animateStep);
    }, 2000);
  };

  // Control functions
  const toggleAnimation = () => {
    setIsAnimating(!isAnimating);
  };

  const reset = () => {
    setIsAnimating(false);
    setCurrentStep(0);
    setLayers(prev => prev.map(layer => ({ ...layer, active: false })));
    setDataFlows(prev => prev.map(flow => ({ ...flow, active: false })));
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const stepForward = () => {
    if (!isAnimating) {
      setCurrentStep(prev => (prev + 1) % layers.length);
    }
  };

  const stepBackward = () => {
    if (!isAnimating) {
      setCurrentStep(prev => (prev - 1 + layers.length) % layers.length);
    }
  };

  // Initialize architecture when parameters change
  useEffect(() => {
    initializeArchitecture();
  }, [architecture, numLayers]);

  // Handle animation
  useEffect(() => {
    if (isAnimating) {
      animationRef.current = requestAnimationFrame(animateStep);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnimating, layers.length]);

  // Update layer activation when step changes manually
  useEffect(() => {
    if (!isAnimating) {
      setLayers(prev => prev.map((layer, index) => ({
        ...layer,
        active: index === currentStep
      })));

      setDataFlows(prev => prev.map(flow => {
        const fromIndex = layers.findIndex(l => l.id === flow.from);
        const toIndex = layers.findIndex(l => l.id === flow.to);
        return {
          ...flow,
          active: fromIndex === currentStep || toIndex === currentStep
        };
      }));
    }
  }, [currentStep, isAnimating]);

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
    if (!svgRef.current || !dimensionsRef.current || layers.length === 0) return;

    const svg = svgRef.current;
    const dimensions = dimensionsRef.current;

    svg.selectAll("*").remove();

    const chartGroup = svg
      .append('g')
      .attr('transform', `translate(${dimensions.margin.left},${dimensions.margin.top})`);

    // Draw data flow arrows
    const arrowGroup = chartGroup.append('g').attr('class', 'arrows');

    dataFlows.forEach(flow => {
      const fromLayer = layers.find(l => l.id === flow.from);
      const toLayer = layers.find(l => l.id === flow.to);

      if (fromLayer && toLayer) {
        const fromX = fromLayer.x + fromLayer.width / 2;
        const fromY = fromLayer.y + fromLayer.height;
        const toX = toLayer.x + toLayer.width / 2;
        const toY = toLayer.y;

        // Draw arrow
        arrowGroup
          .append('line')
          .attr('x1', fromX)
          .attr('y1', fromY)
          .attr('x2', toX)
          .attr('y2', toY)
          .attr('stroke', flow.active ? '#ff6b6b' : '#ccc')
          .attr('stroke-width', flow.active ? 3 : 1)
          .attr('opacity', flow.active ? 1 : 0.5)
          .attr('marker-end', flow.active ? 'url(#arrowhead-active)' : 'url(#arrowhead)');
      }
    });

    // Add arrowhead markers
    const defs = svg.append('defs');

    defs.append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 8)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#ccc');

    defs.append('marker')
      .attr('id', 'arrowhead-active')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 8)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#ff6b6b');

    // Draw layers
    const layerGroup = chartGroup.append('g').attr('class', 'layers');

    layers.forEach(layer => {
      const layerElement = layerGroup
        .append('g')
        .attr('class', `layer layer-${layer.type}`)
        .attr('transform', `translate(${layer.x}, ${layer.y})`);

      // Layer background
      layerElement
        .append('rect')
        .attr('width', layer.width)
        .attr('height', layer.height)
        .attr('rx', 8)
        .attr('fill', layer.active ? '#ffd700' : getLayerColor(layer.type))
        .attr('stroke', layer.active ? '#ff6b6b' : '#333')
        .attr('stroke-width', layer.active ? 3 : 1)
        .attr('opacity', layer.active ? 1 : 0.8);

      // Layer title
      layerElement
        .append('text')
        .attr('x', layer.width / 2)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .attr('fill', layer.active ? '#333' : 'white')
        .text(layer.name);

      // Layer components
      layer.components.forEach((component, index) => {
        layerElement
          .append('text')
          .attr('x', layer.width / 2)
          .attr('y', 35 + index * 12)
          .attr('text-anchor', 'middle')
          .attr('font-size', '9px')
          .attr('fill', layer.active ? '#666' : 'rgba(255,255,255,0.8)')
          .text(component);
      });

      // Add residual connection indicators
      if (showResidual && (layer.type === 'encoder' || layer.type === 'decoder')) {
        layerElement
          .append('path')
          .attr('d', `M ${layer.width + 10} 10 Q ${layer.width + 30} ${layer.height / 2} ${layer.width + 10} ${layer.height - 10}`)
          .attr('stroke', '#4ecdc4')
          .attr('stroke-width', 2)
          .attr('fill', 'none')
          .attr('stroke-dasharray', '3,3')
          .attr('opacity', 0.7);
      }

      // Add attention indicators
      if (showAttention && (layer.type === 'encoder' || layer.type === 'decoder')) {
        layerElement
          .append('circle')
          .attr('cx', layer.width - 15)
          .attr('cy', 15)
          .attr('r', 8)
          .attr('fill', '#ff9ff3')
          .attr('opacity', 0.8);

        layerElement
          .append('text')
          .attr('x', layer.width - 15)
          .attr('y', 19)
          .attr('text-anchor', 'middle')
          .attr('font-size', '8px')
          .attr('font-weight', 'bold')
          .attr('fill', 'white')
          .text('ATT');
      }
    });

    // Add input/output text
    if (layers.length > 0) {
      const inputLayer = layers[0];
      chartGroup
        .append('text')
        .attr('x', inputLayer.x + inputLayer.width / 2)
        .attr('y', inputLayer.y - 10)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .attr('fill', '#333')
        .text(`Input: "${inputText}"`);

      const outputLayer = layers[layers.length - 1];
      chartGroup
        .append('text')
        .attr('x', outputLayer.x + outputLayer.width / 2)
        .attr('y', outputLayer.y + outputLayer.height + 25)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .attr('fill', '#333')
        .text('Output: Probability Distribution');
    }

    // Add step indicator
    chartGroup
      .append('text')
      .attr('x', dimensions.innerWidth - 100)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .attr('fill', '#667eea')
      .text(`Step ${currentStep + 1}/${layers.length}`);
  };

  const getLayerColor = (type: string): string => {
    switch (type) {
      case 'embedding': return colorSchemes.primary;
      case 'encoder': return colorSchemes.success;
      case 'decoder': return colorSchemes.warning;
      case 'output': return colorSchemes.error;
      default: return colorSchemes.primary;
    }
  };

  useEffect(() => {
    updateVisualization();
  }, [layers, dataFlows, currentStep, showAttention, showResidual, inputText]);

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
            placeholder="Enter input text..."
          />
        </div>

        <div className="control-group">
          <label>Architecture</label>
          <select
            value={architecture}
            onChange={(e) => setArchitecture(e.target.value as any)}
            className="select-input"
          >
            <option value="encoder-only">Encoder Only (BERT-like)</option>
            <option value="decoder-only">Decoder Only (GPT-like)</option>
            <option value="encoder-decoder">Encoder-Decoder (T5-like)</option>
          </select>
        </div>

        <div className="control-group">
          <label>Number of Layers: {numLayers}</label>
          <input
            type="range"
            min="1"
            max="6"
            value={numLayers}
            onChange={(e) => setNumLayers(parseInt(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label>Visualization Options</label>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={showAttention}
                onChange={(e) => setShowAttention(e.target.checked)}
              />
              Show Attention
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={showResidual}
                onChange={(e) => setShowResidual(e.target.checked)}
              />
              Show Residual Connections
            </label>
          </div>
        </div>
      </div>

      <div className="button-group">
        <button
          className={`btn ${isAnimating ? 'btn-secondary' : 'btn-primary'}`}
          onClick={toggleAnimation}
          disabled={layers.length === 0}
        >
          {isAnimating ? <Pause size={16} /> : <Play size={16} />}
          {isAnimating ? 'Pause' : 'Animate'} Flow
        </button>

        <button
          className="btn btn-secondary"
          onClick={stepBackward}
          disabled={isAnimating}
        >
          ← Step Back
        </button>

        <button
          className="btn btn-secondary"
          onClick={stepForward}
          disabled={isAnimating}
        >
          Step Forward →
        </button>

        <button className="btn btn-secondary" onClick={reset}>
          <RotateCcw size={16} />
          Reset
        </button>
      </div>
    </>
  );

  const stats = [
    { label: 'Architecture', value: architecture.replace('-', ' '), icon: <Layers size={16} /> },
    { label: 'Total Layers', value: layers.length, icon: <Layers size={16} /> },
    { label: 'Current Step', value: `${currentStep + 1}/${layers.length}`, icon: <ArrowRight size={16} /> },
    { label: 'Active Layer', value: layers[currentStep]?.name || 'None', icon: <Zap size={16} /> }
  ];

  return (
    <VisualizationBase
      title="Transformer Architecture"
      description="Explore the transformer architecture with step-by-step data flow visualization"
      controls={controls}
      stats={stats}
      onVisualizationReady={handleVisualizationReady}
      width={1000}
      height={800}
    >
      <style jsx>{`
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

        .checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          cursor: pointer;
        }
      `}</style>
    </VisualizationBase>
  );
};

export default Transformer;
