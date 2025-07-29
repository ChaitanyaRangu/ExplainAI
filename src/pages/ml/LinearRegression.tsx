import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as d3 from 'd3';
import { Play, Pause, RotateCcw, Plus } from 'lucide-react';

interface DataPoint {
  x: number;
  y: number;
}

const LinearRegression = () => {
  const [data, setData] = useState<DataPoint[]>([
    { x: 1, y: 2 },
    { x: 2, y: 4 },
    { x: 3, y: 3 },
    { x: 4, y: 6 },
    { x: 5, y: 5 },
    { x: 6, y: 7 },
    { x: 7, y: 8 },
    { x: 8, y: 9 }
  ]);
  
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentIteration, setCurrentIteration] = useState(0);
  const [slope, setSlope] = useState(1);
  const [intercept, setIntercept] = useState(0);
  const [cost, setCost] = useState(0);
  const [learningRate, setLearningRate] = useState(0.01);
  
  const svgRef = useRef<SVGSVGElement>(null);
  const animationRef = useRef<number>();

  const width = 600;
  const height = 400;
  const margin = { top: 20, right: 20, bottom: 40, left: 40 };

  // Calculate linear regression coefficients
  const calculateRegression = (points: DataPoint[]) => {
    const n = points.length;
    const sumX = points.reduce((sum, p) => sum + p.x, 0);
    const sumY = points.reduce((sum, p) => sum + p.y, 0);
    const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0);
    const sumXX = points.reduce((sum, p) => sum + p.x * p.x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  };

  // Calculate mean squared error
  const calculateCost = (points: DataPoint[], m: number, b: number) => {
    const mse = points.reduce((sum, point) => {
      const predicted = m * point.x + b;
      const error = point.y - predicted;
      return sum + error * error;
    }, 0) / points.length;
    return mse;
  };

  // Gradient descent step
  const gradientDescentStep = (points: DataPoint[], m: number, b: number, lr: number) => {
    const n = points.length;
    let slopeGradient = 0;
    let interceptGradient = 0;

    points.forEach(point => {
      const predicted = m * point.x + b;
      const error = predicted - point.y;
      slopeGradient += (2 / n) * error * point.x;
      interceptGradient += (2 / n) * error;
    });

    const newSlope = m - lr * slopeGradient;
    const newIntercept = b - lr * interceptGradient;

    return { slope: newSlope, intercept: newIntercept };
  };

  // Animation loop for gradient descent
  const animate = () => {
    if (!isAnimating) return;

    const { slope: newSlope, intercept: newIntercept } = gradientDescentStep(
      data, slope, intercept, learningRate
    );
    
    setSlope(newSlope);
    setIntercept(newIntercept);
    setCost(calculateCost(data, newSlope, newIntercept));
    setCurrentIteration(prev => prev + 1);

    animationRef.current = requestAnimationFrame(animate);
  };

  // Start/stop animation
  const toggleAnimation = () => {
    setIsAnimating(!isAnimating);
  };

  // Reset to initial state
  const reset = () => {
    setIsAnimating(false);
    setCurrentIteration(0);
    setSlope(1);
    setIntercept(0);
    setCost(calculateCost(data, 1, 0));
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  // Add random data point
  const addRandomPoint = () => {
    const newPoint = {
      x: Math.random() * 10,
      y: Math.random() * 10
    };
    setData([...data, newPoint]);
  };

  // Find optimal solution
  const findOptimal = () => {
    const optimal = calculateRegression(data);
    setSlope(optimal.slope);
    setIntercept(optimal.intercept);
    setCost(calculateCost(data, optimal.slope, optimal.intercept));
    setIsAnimating(false);
  };

  useEffect(() => {
    if (isAnimating) {
      animationRef.current = requestAnimationFrame(animate);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnimating, slope, intercept, data, learningRate]);

  // D3 visualization
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const xScale = d3.scaleLinear()
      .domain([0, 10])
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([0, 10])
      .range([height - margin.bottom, margin.top]);

    // Add axes
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale));

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale));

    // Add axis labels
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 5)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text("X");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Y");

    // Add data points
    svg.selectAll(".data-point")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "data-point")
      .attr("cx", d => xScale(d.x))
      .attr("cy", d => yScale(d.y))
      .attr("r", 5)
      .attr("fill", "#667eea")
      .attr("stroke", "white")
      .attr("stroke-width", 2);

    // Add regression line
    const lineData = [
      { x: 0, y: intercept },
      { x: 10, y: slope * 10 + intercept }
    ];

    svg.append("line")
      .attr("class", "regression-line")
      .attr("x1", xScale(lineData[0].x))
      .attr("y1", yScale(lineData[0].y))
      .attr("x2", xScale(lineData[1].x))
      .attr("y2", yScale(lineData[1].y))
      .attr("stroke", "#ff6b6b")
      .attr("stroke-width", 3)
      .attr("opacity", 0.8);

    // Add error lines
    svg.selectAll(".error-line")
      .data(data)
      .enter()
      .append("line")
      .attr("class", "error-line")
      .attr("x1", d => xScale(d.x))
      .attr("y1", d => yScale(d.y))
      .attr("x2", d => xScale(d.x))
      .attr("y2", d => yScale(slope * d.x + intercept))
      .attr("stroke", "#ff9999")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3,3")
      .attr("opacity", 0.6);

  }, [data, slope, intercept]);

  return (
    <div className="visualization-container">
      <div className="visualization-header">
        <h1>Linear Regression Visualizer</h1>
        <p>Watch how gradient descent finds the best fit line through your data points</p>
      </div>

      <div className="controls-panel">
        <div className="controls-grid">
          <div className="control-group">
            <label>Learning Rate: {learningRate.toFixed(3)}</label>
            <input
              type="range"
              min="0.001"
              max="0.1"
              step="0.001"
              value={learningRate}
              onChange={(e) => setLearningRate(parseFloat(e.target.value))}
            />
          </div>
          
          <div className="control-group">
            <label>Current Slope: {slope.toFixed(3)}</label>
            <input
              type="range"
              min="-2"
              max="3"
              step="0.01"
              value={slope}
              onChange={(e) => setSlope(parseFloat(e.target.value))}
            />
          </div>
          
          <div className="control-group">
            <label>Current Intercept: {intercept.toFixed(3)}</label>
            <input
              type="range"
              min="-5"
              max="5"
              step="0.01"
              value={intercept}
              onChange={(e) => setIntercept(parseFloat(e.target.value))}
            />
          </div>
        </div>

        <div className="button-group">
          <button 
            className={`btn ${isAnimating ? 'btn-secondary' : 'btn-primary'}`}
            onClick={toggleAnimation}
          >
            {isAnimating ? <Pause size={16} /> : <Play size={16} />}
            {isAnimating ? 'Pause' : 'Start'} Gradient Descent
          </button>
          
          <button className="btn btn-secondary" onClick={reset}>
            <RotateCcw size={16} />
            Reset
          </button>
          
          <button className="btn btn-secondary" onClick={addRandomPoint}>
            <Plus size={16} />
            Add Point
          </button>
          
          <button className="btn btn-primary" onClick={findOptimal}>
            Find Optimal
          </button>
        </div>
      </div>

      <div className="visualization-content">
        <div className="chart-container">
          <svg ref={svgRef} width={width} height={height}></svg>
        </div>
        
        <div className="stats-panel">
          <div className="stat-item">
            <span className="stat-label">Iteration</span>
            <span className="stat-value">{currentIteration}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Cost (MSE)</span>
            <span className="stat-value">{cost.toFixed(4)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Data Points</span>
            <span className="stat-value">{data.length}</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .visualization-content {
          display: flex;
          gap: 2rem;
          align-items: flex-start;
        }

        .chart-container {
          flex: 1;
          background: white;
          border-radius: 12px;
          padding: 1rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .stats-panel {
          min-width: 200px;
          background: #f8f9fa;
          border-radius: 12px;
          padding: 1.5rem;
        }

        .stat-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid #e9ecef;
        }

        .stat-item:last-child {
          border-bottom: none;
        }

        .stat-label {
          font-weight: 600;
          color: #495057;
        }

        .stat-value {
          font-weight: 700;
          color: #667eea;
          font-size: 1.1rem;
        }

        .button-group {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          margin-top: 1rem;
        }

        @media (max-width: 768px) {
          .visualization-content {
            flex-direction: column;
          }
          
          .stats-panel {
            min-width: auto;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default LinearRegression;
