import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as d3 from 'd3';
import { MessageSquare, Play, Copy, RotateCcw, Zap, Target, TrendingUp, Shuffle } from 'lucide-react';
import VisualizationBase from '../../components/VisualizationBase';
import { colorSchemes, ChartDimensions } from '../../utils/d3-helpers';

interface PromptVariant {
  id: string;
  text: string;
  technique: string;
  responses: Response[];
  avgConfidence: number;
  avgLength: number;
}

interface Response {
  text: string;
  probability: number;
  confidence: number;
  tokens: string[];
}

interface PromptTechnique {
  name: string;
  description: string;
  template: string;
  example: string;
}

const PromptExplorer = () => {
  const [basePrompt, setBasePrompt] = useState("Explain quantum computing");
  const [selectedTechnique, setSelectedTechnique] = useState("zero-shot");
  const [promptVariants, setPromptVariants] = useState<PromptVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(100);
  const [showProbabilities, setShowProbabilities] = useState(true);
  const [comparisonMode, setComparisonMode] = useState(false);

  const svgRef = useRef<d3.Selection<SVGSVGElement, unknown, null, undefined>>();
  const dimensionsRef = useRef<ChartDimensions>();

  const promptTechniques: PromptTechnique[] = [
    {
      name: "zero-shot",
      description: "Direct instruction without examples",
      template: "{prompt}",
      example: "Explain quantum computing"
    },
    {
      name: "few-shot",
      description: "Provide examples before the task",
      template: "Example 1: {example1}\nExample 2: {example2}\n\nNow: {prompt}",
      example: "Example: Explain AI: AI is computer intelligence.\nNow: Explain quantum computing"
    },
    {
      name: "chain-of-thought",
      description: "Ask for step-by-step reasoning",
      template: "{prompt} Let's think step by step:",
      example: "Explain quantum computing. Let's think step by step:"
    },
    {
      name: "role-playing",
      description: "Assign a specific role to the model",
      template: "You are a {role}. {prompt}",
      example: "You are a quantum physics professor. Explain quantum computing"
    },
    {
      name: "constraint-based",
      description: "Add specific constraints or format requirements",
      template: "{prompt} Please provide your answer in {constraint}.",
      example: "Explain quantum computing. Please provide your answer in exactly 3 bullet points."
    },
    {
      name: "comparative",
      description: "Ask for comparisons or contrasts",
      template: "Compare and contrast {prompt} with {comparison}",
      example: "Compare and contrast quantum computing with classical computing"
    }
  ];

  // Generate simulated responses for different prompt variants
  const generateResponses = (prompt: string, technique: string): Response[] => {
    const responses: Response[] = [];
    const numResponses = 5;

    // Simulate different response characteristics based on technique
    const baseWords = ["quantum", "computing", "superposition", "entanglement", "qubits", "algorithms", "parallel", "processing"];

    for (let i = 0; i < numResponses; i++) {
      const responseLength = Math.floor(Math.random() * 50) + 20;
      const tokens = [];

      // Generate response tokens based on technique
      for (let j = 0; j < responseLength; j++) {
        if (Math.random() < 0.3) {
          tokens.push(baseWords[Math.floor(Math.random() * baseWords.length)]);
        } else {
          tokens.push(`word${j}`);
        }
      }

      // Simulate probability and confidence based on technique and temperature
      let baseProbability = 0.3 + Math.random() * 0.4;
      let baseConfidence = 0.5 + Math.random() * 0.3;

      // Adjust based on technique
      switch (technique) {
        case "few-shot":
          baseProbability += 0.1;
          baseConfidence += 0.1;
          break;
        case "chain-of-thought":
          baseConfidence += 0.15;
          break;
        case "role-playing":
          baseProbability += 0.05;
          baseConfidence += 0.05;
          break;
      }

      // Adjust based on temperature
      baseProbability *= (1 - temperature * 0.3);
      baseConfidence *= (1 - temperature * 0.2);

      responses.push({
        text: tokens.join(" "),
        probability: Math.min(0.95, Math.max(0.05, baseProbability)),
        confidence: Math.min(0.95, Math.max(0.1, baseConfidence)),
        tokens
      });
    }

    return responses.sort((a, b) => b.probability - a.probability);
  };

  // Apply prompt technique to base prompt
  const applyTechnique = (prompt: string, technique: string): string => {
    const techniqueObj = promptTechniques.find(t => t.name === technique);
    if (!techniqueObj) return prompt;

    let result = techniqueObj.template;

    switch (technique) {
      case "zero-shot":
        result = result.replace("{prompt}", prompt);
        break;
      case "few-shot":
        result = result.replace("{example1}", "Explain AI: AI is artificial intelligence that mimics human thinking.")
                      .replace("{example2}", "Explain blockchain: Blockchain is a distributed ledger technology.")
                      .replace("{prompt}", prompt);
        break;
      case "chain-of-thought":
        result = result.replace("{prompt}", prompt);
        break;
      case "role-playing":
        result = result.replace("{role}", "expert teacher")
                      .replace("{prompt}", prompt);
        break;
      case "constraint-based":
        result = result.replace("{prompt}", prompt)
                      .replace("{constraint}", "exactly 3 bullet points");
        break;
      case "comparative":
        result = result.replace("{prompt}", prompt)
                      .replace("{comparison}", "classical computing");
        break;
    }

    return result;
  };

  // Generate prompt variants
  const generateVariants = () => {
    const variants: PromptVariant[] = [];

    if (comparisonMode) {
      // Generate variants for all techniques
      promptTechniques.forEach(technique => {
        const promptText = applyTechnique(basePrompt, technique.name);
        const responses = generateResponses(promptText, technique.name);

        variants.push({
          id: technique.name,
          text: promptText,
          technique: technique.name,
          responses,
          avgConfidence: responses.reduce((sum, r) => sum + r.confidence, 0) / responses.length,
          avgLength: responses.reduce((sum, r) => sum + r.tokens.length, 0) / responses.length
        });
      });
    } else {
      // Generate single variant for selected technique
      const promptText = applyTechnique(basePrompt, selectedTechnique);
      const responses = generateResponses(promptText, selectedTechnique);

      variants.push({
        id: selectedTechnique,
        text: promptText,
        technique: selectedTechnique,
        responses,
        avgConfidence: responses.reduce((sum, r) => sum + r.confidence, 0) / responses.length,
        avgLength: responses.reduce((sum, r) => sum + r.tokens.length, 0) / responses.length
      });
    }

    setPromptVariants(variants);
    setSelectedVariant(variants[0]?.id || null);
  };

  // Copy prompt to clipboard
  const copyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
  };

  // Initialize variants
  useEffect(() => {
    generateVariants();
  }, [basePrompt, selectedTechnique, temperature, maxTokens, comparisonMode]);

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
    if (!svgRef.current || !dimensionsRef.current || promptVariants.length === 0) return;

    const svg = svgRef.current;
    const dimensions = dimensionsRef.current;

    svg.selectAll("*").remove();

    const chartGroup = svg
      .append('g')
      .attr('transform', `translate(${dimensions.margin.left},${dimensions.margin.top})`);

    if (comparisonMode) {
      // Comparison visualization - bar chart of techniques
      const barWidth = dimensions.innerWidth / promptVariants.length;
      const maxConfidence = Math.max(...promptVariants.map(v => v.avgConfidence));
      const yScale = d3.scaleLinear()
        .domain([0, maxConfidence])
        .range([dimensions.innerHeight - 100, 0]);

      promptVariants.forEach((variant, index) => {
        const x = index * barWidth;
        const barHeight = dimensions.innerHeight - 100 - yScale(variant.avgConfidence);

        // Bar
        chartGroup
          .append('rect')
          .attr('x', x + 10)
          .attr('y', yScale(variant.avgConfidence))
          .attr('width', barWidth - 20)
          .attr('height', barHeight)
          .attr('fill', selectedVariant === variant.id ? colorSchemes.accent : colorSchemes.primary)
          .attr('stroke', '#333')
          .attr('stroke-width', 1)
          .style('cursor', 'pointer')
          .on('click', () => setSelectedVariant(variant.id));

        // Label
        chartGroup
          .append('text')
          .attr('x', x + barWidth / 2)
          .attr('y', dimensions.innerHeight - 80)
          .attr('text-anchor', 'middle')
          .attr('font-size', '10px')
          .attr('font-weight', 'bold')
          .text(variant.technique.replace('-', ' '))
          .style('cursor', 'pointer')
          .on('click', () => setSelectedVariant(variant.id));

        // Value
        chartGroup
          .append('text')
          .attr('x', x + barWidth / 2)
          .attr('y', yScale(variant.avgConfidence) - 5)
          .attr('text-anchor', 'middle')
          .attr('font-size', '12px')
          .attr('font-weight', 'bold')
          .attr('fill', '#333')
          .text(variant.avgConfidence.toFixed(2));
      });

      // Y-axis
      chartGroup
        .append('g')
        .call(d3.axisLeft(yScale));

      // Axis label
      chartGroup
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -dimensions.innerHeight / 2)
        .attr('y', -30)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .text('Average Confidence');

    } else {
      // Single variant visualization - response probabilities
      const selectedVar = promptVariants.find(v => v.id === selectedVariant);
      if (!selectedVar) return;

      const responses = selectedVar.responses.slice(0, 5); // Top 5 responses
      const barHeight = (dimensions.innerHeight - 100) / responses.length;
      const maxProb = Math.max(...responses.map(r => r.probability));
      const xScale = d3.scaleLinear()
        .domain([0, maxProb])
        .range([0, dimensions.innerWidth - 200]);

      responses.forEach((response, index) => {
        const y = index * barHeight + 20;
        const barWidth = xScale(response.probability);

        // Probability bar
        chartGroup
          .append('rect')
          .attr('x', 0)
          .attr('y', y)
          .attr('width', barWidth)
          .attr('height', barHeight - 5)
          .attr('fill', d3.interpolateViridis(response.confidence))
          .attr('stroke', '#333')
          .attr('stroke-width', 1);

        // Response text (truncated)
        const truncatedText = response.text.length > 50
          ? response.text.substring(0, 50) + "..."
          : response.text;

        chartGroup
          .append('text')
          .attr('x', barWidth + 10)
          .attr('y', y + barHeight / 2 + 4)
          .attr('font-size', '10px')
          .attr('fill', '#333')
          .text(truncatedText);

        // Probability value
        chartGroup
          .append('text')
          .attr('x', barWidth / 2)
          .attr('y', y + barHeight / 2 + 4)
          .attr('text-anchor', 'middle')
          .attr('font-size', '10px')
          .attr('font-weight', 'bold')
          .attr('fill', 'white')
          .text((response.probability * 100).toFixed(1) + '%');
      });

      // X-axis
      chartGroup
        .append('g')
        .attr('transform', `translate(0, ${dimensions.innerHeight - 80})`)
        .call(d3.axisBottom(xScale).tickFormat(d => (d * 100).toFixed(0) + '%'));

      // Axis label
      chartGroup
        .append('text')
        .attr('x', dimensions.innerWidth / 2)
        .attr('y', dimensions.innerHeight - 40)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .text('Response Probability');
    }
  };

  useEffect(() => {
    updateVisualization();
  }, [promptVariants, selectedVariant, comparisonMode]);

  const controls = (
    <>
      <div className="controls-grid">
        <div className="control-group">
          <label>Base Prompt</label>
          <textarea
            value={basePrompt}
            onChange={(e) => setBasePrompt(e.target.value)}
            className="text-input"
            rows={3}
            placeholder="Enter your base prompt..."
          />
        </div>

        <div className="control-group">
          <label>Prompt Technique</label>
          <select
            value={selectedTechnique}
            onChange={(e) => setSelectedTechnique(e.target.value)}
            className="select-input"
            disabled={comparisonMode}
          >
            {promptTechniques.map(technique => (
              <option key={technique.name} value={technique.name}>
                {technique.name.replace('-', ' ')} - {technique.description}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label>Temperature: {temperature.toFixed(2)}</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label>Max Tokens: {maxTokens}</label>
          <input
            type="range"
            min="50"
            max="200"
            step="10"
            value={maxTokens}
            onChange={(e) => setMaxTokens(parseInt(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label>Visualization Options</label>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={comparisonMode}
                onChange={(e) => setComparisonMode(e.target.checked)}
              />
              Compare All Techniques
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={showProbabilities}
                onChange={(e) => setShowProbabilities(e.target.checked)}
              />
              Show Probabilities
            </label>
          </div>
        </div>
      </div>

      <div className="button-group">
        <button className="btn btn-primary" onClick={generateVariants}>
          <Play size={16} />
          Generate Responses
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => copyPrompt(promptVariants.find(v => v.id === selectedVariant)?.text || basePrompt)}
          disabled={!selectedVariant}
        >
          <Copy size={16} />
          Copy Prompt
        </button>

        <button className="btn btn-secondary" onClick={() => setBasePrompt("Explain quantum computing")}>
          <RotateCcw size={16} />
          Reset
        </button>

        <button className="btn btn-secondary" onClick={() => {
          const examples = [
            "Explain machine learning",
            "Write a creative story about space",
            "Solve this math problem: 2x + 5 = 15",
            "Describe the benefits of renewable energy",
            "Compare Python and JavaScript programming languages"
          ];
          setBasePrompt(examples[Math.floor(Math.random() * examples.length)]);
        }}>
          <Shuffle size={16} />
          Random Example
        </button>
      </div>
    </>
  );

  const selectedVar = promptVariants.find(v => v.id === selectedVariant);
  const stats = [
    { label: 'Prompt Variants', value: promptVariants.length, icon: <MessageSquare size={16} /> },
    { label: 'Selected Technique', value: selectedTechnique.replace('-', ' '), icon: <Target size={16} /> },
    { label: 'Avg Confidence', value: selectedVar ? selectedVar.avgConfidence.toFixed(3) : 'N/A', icon: <TrendingUp size={16} /> },
    { label: 'Avg Response Length', value: selectedVar ? Math.round(selectedVar.avgLength) + ' tokens' : 'N/A', icon: <Zap size={16} /> }
  ];

  return (
    <VisualizationBase
      title="Prompt Engineering Explorer"
      description="Experiment with different prompting techniques and analyze their effectiveness"
      controls={controls}
      stats={stats}
      onVisualizationReady={handleVisualizationReady}
      width={1000}
      height={600}
    >
      <div className="prompt-details">
        {selectedVar && (
          <motion.div
            className="prompt-display"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3>Current Prompt ({selectedVar.technique.replace('-', ' ')})</h3>
            <div className="prompt-text">
              {selectedVar.text}
            </div>

            {!comparisonMode && (
              <div className="responses-section">
                <h4>Top Responses</h4>
                <div className="responses-list">
                  {selectedVar.responses.slice(0, 3).map((response, index) => (
                    <div key={index} className="response-item">
                      <div className="response-header">
                        <span className="response-rank">#{index + 1}</span>
                        <span className="response-prob">{(response.probability * 100).toFixed(1)}%</span>
                        <span className="response-conf">Conf: {(response.confidence * 100).toFixed(1)}%</span>
                      </div>
                      <div className="response-text">
                        {response.text.substring(0, 150)}...
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      <style jsx>{`
        .text-input {
          width: 100%;
          min-height: 80px;
          resize: vertical;
          padding: 0.75rem;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          font-size: 0.9rem;
          font-family: 'Courier New', monospace;
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

        .prompt-details {
          margin-top: 2rem;
          width: 100%;
        }

        .prompt-display {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid #e9ecef;
        }

        .prompt-display h3 {
          margin: 0 0 1rem 0;
          color: #333;
          font-size: 1.2rem;
        }

        .prompt-text {
          background: white;
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid #ddd;
          font-family: 'Courier New', monospace;
          font-size: 0.9rem;
          line-height: 1.5;
          margin-bottom: 1.5rem;
        }

        .responses-section h4 {
          margin: 0 0 1rem 0;
          color: #333;
          font-size: 1.1rem;
        }

        .responses-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .response-item {
          background: white;
          border-radius: 8px;
          padding: 1rem;
          border: 1px solid #ddd;
        }

        .response-header {
          display: flex;
          gap: 1rem;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          font-weight: bold;
        }

        .response-rank {
          color: #667eea;
        }

        .response-prob {
          color: #4ecdc4;
        }

        .response-conf {
          color: #ff6b6b;
        }

        .response-text {
          font-size: 0.9rem;
          line-height: 1.4;
          color: #555;
        }

        @media (max-width: 768px) {
          .response-header {
            flex-direction: column;
            gap: 0.25rem;
          }
        }
      `}</style>
    </VisualizationBase>
  );
};

export default PromptExplorer;
