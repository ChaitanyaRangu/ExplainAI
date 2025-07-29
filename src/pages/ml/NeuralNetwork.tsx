import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as d3 from 'd3';
import { Play, Pause, RotateCcw, Zap, Brain, Settings } from 'lucide-react';
import VisualizationBase from '../../components/VisualizationBase';
import { colorSchemes, ChartDimensions } from '../../utils/d3-helpers';

interface Neuron {
  id: string;
  layer: number;
  index: number;
  value: number;
  bias: number;
  x: number;
  y: number;
}

interface Connection {
  from: string;
  to: string;
  weight: number;
  value: number;
}

interface NetworkArchitecture {
  layers: number[];
}

const NeuralNetwork = () => {
  const [architecture, setArchitecture] = useState<NetworkArchitecture>({ layers: [2, 4, 3, 1] });
  const [neurons, setNeurons] = useState<Neuron[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [inputValues, setInputValues] = useState([0.5, 0.8]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [learningRate, setLearningRate] = useState(0.1);
  const [activationFunction, setActivationFunction] = useState<'sigmoid' | 'relu' | 'tanh'>('sigmoid');
  const [currentStep, setCurrentStep] = useState(0);
  const [loss, setLoss] = useState(0);

  const animationRef = useRef<number>();
  const svgRef = useRef<d3.Selection<SVGSVGElement, unknown, null, undefined>>();
  const dimensionsRef = useRef<ChartDimensions>();

  // Activation functions
  const activationFunctions = {
    sigmoid: (x: number) => 1 / (1 + Math.exp(-x)),
    relu: (x: number) => Math.max(0, x),
    tanh: (x: number) => Math.tanh(x)
  };

  // Initialize network
  const initializeNetwork = () => {
    const newNeurons: Neuron[] = [];
    const newConnections: Connection[] = [];

    // Create neurons
    architecture.layers.forEach((layerSize, layerIndex) => {
      for (let i = 0; i < layerSize; i++) {
        newNeurons.push({
          id: `${layerIndex}-${i}`,
          layer: layerIndex,
          index: i,
          value: layerIndex === 0 ? inputValues[i] || 0 : 0,
          bias: (Math.random() - 0.5) * 2,
          x: 0, // Will be calculated in layout
          y: 0  // Will be calculated in layout
        });
      }
    });

    // Create connections
    for (let layerIndex = 0; layerIndex < architecture.layers.length - 1; layerIndex++) {
      const currentLayerSize = architecture.layers[layerIndex];
      const nextLayerSize = architecture.layers[layerIndex + 1];

      for (let i = 0; i < currentLayerSize; i++) {
        for (let j = 0; j < nextLayerSize; j++) {
          newConnections.push({
            from: `${layerIndex}-${i}`,
            to: `${layerIndex + 1}-${j}`,
            weight: (Math.random() - 0.5) * 2,
            value: 0
          });
        }
      }
    }

    setNeurons(newNeurons);
    setConnections(newConnections);
    setCurrentStep(0);
  };

  // Forward propagation
  const forwardPropagate = () => {
    const updatedNeurons = [...neurons];

    // Set input values
    inputValues.forEach((value, index) => {
      const neuron = updatedNeurons.find(n => n.layer === 0 && n.index === index);
      if (neuron) neuron.value = value;
    });

    // Propagate through layers
    for (let layerIndex = 1; layerIndex < architecture.layers.length; layerIndex++) {
      const layerNeurons = updatedNeurons.filter(n => n.layer === layerIndex);

      layerNeurons.forEach(neuron => {
        let sum = neuron.bias;

        // Sum weighted inputs from previous layer
        const incomingConnections = connections.filter(c => c.to === neuron.id);
        incomingConnections.forEach(connection => {
          const fromNeuron = updatedNeurons.find(n => n.id === connection.from);
          if (fromNeuron) {
            sum += fromNeuron.value * connection.weight;
          }
        });

        // Apply activation function
        neuron.value = activationFunctions[activationFunction](sum);
      });
    }

    setNeurons(updatedNeurons);

    // Calculate simple loss (for demonstration)
    const outputNeurons = updatedNeurons.filter(n => n.layer === architecture.layers.length - 1);
    const target = 0.7; // Simple target for demo
    const currentLoss = outputNeurons.reduce((sum, neuron) =>
      sum + Math.pow(neuron.value - target, 2), 0) / outputNeurons.length;
    setLoss(currentLoss);
  };

  // Animation step
  const animationStep = () => {
    if (!isAnimating) return;

    forwardPropagate();
    setCurrentStep(prev => prev + 1);

    setTimeout(() => {
      animationRef.current = requestAnimationFrame(animationStep);
    }, 1000);
  };

  // Control functions
  const toggleAnimation = () => {
    setIsAnimating(!isAnimating);
  };

  const reset = () => {
    setIsAnimating(false);
    setCurrentStep(0);
    initializeNetwork();
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const addLayer = () => {
    const newLayers = [...architecture.layers];
    newLayers.splice(-1, 0, 3); // Add layer with 3 neurons before output
    setArchitecture({ layers: newLayers });
  };

  const removeLayer = () => {
    if (architecture.layers.length > 3) {
      const newLayers = [...architecture.layers];
      newLayers.splice(-2, 1); // Remove second-to-last layer
      setArchitecture({ layers: newLayers });
    }
  };

  // Initialize network on mount and architecture change
  useEffect(() => {
    initializeNetwork();
  }, [architecture]);

  // Handle animation
  useEffect(() => {
    if (isAnimating) {
      animationRef.current = requestAnimationFrame(animationStep);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnimating]);

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

    const chartGroup = svg
      .append('g')
      .attr('transform', `translate(${dimensions.margin.left},${dimensions.margin.top})`);

    // Calculate neuron positions
    const layerWidth = dimensions.innerWidth / (architecture.layers.length - 1);
    const updatedNeurons = neurons.map(neuron => {
      const layerHeight = dimensions.innerHeight / (architecture.layers[neuron.layer] + 1);
      return {
        ...neuron,
        x: neuron.layer * layerWidth,
        y: (neuron.index + 1) * layerHeight
      };
    });

    // Draw connections
    const connectionGroup = chartGroup.append('g').attr('class', 'connections');

    connections.forEach(connection => {
      const fromNeuron = updatedNeurons.find(n => n.id === connection.from);
      const toNeuron = updatedNeurons.find(n => n.id === connection.to);

      if (fromNeuron && toNeuron) {
        connectionGroup
          .append('line')
          .attr('x1', fromNeuron.x)
          .attr('y1', fromNeuron.y)
          .attr('x2', toNeuron.x)
          .attr('y2', toNeuron.y)
          .attr('stroke', connection.weight > 0 ? colorSchemes.primary : colorSchemes.error)
          .attr('stroke-width', Math.abs(connection.weight) * 2 + 0.5)
          .attr('opacity', 0.6);
      }
    });

    // Draw neurons
    const neuronGroup = chartGroup.append('g').attr('class', 'neurons');

    updatedNeurons.forEach(neuron => {
      const neuronElement = neuronGroup
        .append('g')
        .attr('transform', `translate(${neuron.x},${neuron.y})`);

      // Neuron circle
      neuronElement
        .append('circle')
        .attr('r', 15)
        .attr('fill', d3.interpolateViridis(neuron.value))
        .attr('stroke', '#333')
        .attr('stroke-width', 2);

      // Neuron value text
      neuronElement
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('fill', neuron.value > 0.5 ? 'white' : 'black')
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .text(neuron.value.toFixed(2));

      // Layer labels
      if (neuron.index === 0) {
        neuronElement
          .append('text')
          .attr('x', 0)
          .attr('y', -25)
          .attr('text-anchor', 'middle')
          .attr('fill', '#666')
          .attr('font-size', '12px')
          .attr('font-weight', 'bold')
          .text(
            neuron.layer === 0 ? 'Input' :
            neuron.layer === architecture.layers.length - 1 ? 'Output' :
            `Hidden ${neuron.layer}`
          );
      }
    });

    // Update neuron positions in state
    setNeurons(updatedNeurons);
  };

  // Update visualization when data changes
  useEffect(() => {
    updateVisualization();
  }, [neurons, connections, architecture]);

  const controls = (
    <>
      <div className="controls-grid">
        <div className="control-group">
          <label>Input 1: {inputValues[0].toFixed(2)}</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={inputValues[0]}
            onChange={(e) => {
              const newInputs = [...inputValues];
              newInputs[0] = parseFloat(e.target.value);
              setInputValues(newInputs);
            }}
          />
        </div>

        <div className="control-group">
          <label>Input 2: {inputValues[1].toFixed(2)}</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={inputValues[1]}
            onChange={(e) => {
              const newInputs = [...inputValues];
              newInputs[1] = parseFloat(e.target.value);
              setInputValues(newInputs);
            }}
          />
        </div>

        <div className="control-group">
          <label>Learning Rate: {learningRate.toFixed(3)}</label>
          <input
            type="range"
            min="0.001"
            max="1"
            step="0.001"
            value={learningRate}
            onChange={(e) => setLearningRate(parseFloat(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label>Activation Function</label>
          <select
            value={activationFunction}
            onChange={(e) => setActivationFunction(e.target.value as any)}
            className="select-input"
          >
            <option value="sigmoid">Sigmoid</option>
            <option value="relu">ReLU</option>
            <option value="tanh">Tanh</option>
          </select>
        </div>
      </div>

      <div className="button-group">
        <button
          className={`btn ${isAnimating ? 'btn-secondary' : 'btn-primary'}`}
          onClick={toggleAnimation}
        >
          {isAnimating ? <Pause size={16} /> : <Play size={16} />}
          {isAnimating ? 'Pause' : 'Start'} Forward Prop
        </button>

        <button className="btn btn-secondary" onClick={reset}>
          <RotateCcw size={16} />
          Reset Network
        </button>

        <button className="btn btn-secondary" onClick={addLayer}>
          <Zap size={16} />
          Add Layer
        </button>

        <button
          className="btn btn-secondary"
          onClick={removeLayer}
          disabled={architecture.layers.length <= 3}
        >
          <Settings size={16} />
          Remove Layer
        </button>

        <button className="btn btn-primary" onClick={forwardPropagate}>
          <Brain size={16} />
          Single Step
        </button>
      </div>
    </>
  );

  const stats = [
    { label: 'Forward Steps', value: currentStep, icon: <Brain size={16} /> },
    { label: 'Total Neurons', value: neurons.length, icon: <Zap size={16} /> },
    { label: 'Connections', value: connections.length, icon: <Settings size={16} /> },
    { label: 'Loss', value: loss.toFixed(4), icon: <Play size={16} /> }
  ];

  return (
    <VisualizationBase
      title="Neural Network Playground"
      description="Explore how neural networks process information through layers"
      controls={controls}
      stats={stats}
      onVisualizationReady={handleVisualizationReady}
      width={800}
      height={500}
    />
  );
};

export default NeuralNetwork;
