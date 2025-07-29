import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import * as d3 from 'd3';

interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface ChartDimensions {
  width: number;
  height: number;
  margin: Margin;
  innerWidth: number;
  innerHeight: number;
}

const createChartDimensions = (
  width: number,
  height: number,
  margin: Margin = { top: 20, right: 20, bottom: 40, left: 40 }
): ChartDimensions => ({
  width,
  height,
  margin,
  innerWidth: width - margin.left - margin.right,
  innerHeight: height - margin.top - margin.bottom,
});

interface VisualizationBaseProps {
  title: string;
  description: string;
  width?: number;
  height?: number;
  margin?: Margin;
  children?: React.ReactNode;
  controls?: React.ReactNode;
  stats?: Array<{
    label: string;
    value: string | number;
    icon?: React.ReactNode;
  }>;
  onVisualizationReady?: (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    dimensions: ChartDimensions
  ) => void;
  className?: string;
}

const VisualizationBase: React.FC<VisualizationBaseProps> = ({
  title,
  description,
  width = 600,
  height = 400,
  margin = { top: 20, right: 20, bottom: 40, left: 40 },
  children,
  controls,
  stats,
  onVisualizationReady,
  className = ''
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<ChartDimensions>(
    createChartDimensions(width, height, margin)
  );
  const [isResponsive, setIsResponsive] = useState(false);

  // Handle responsive resizing
  useEffect(() => {
    if (!isResponsive || !containerRef.current) return;

    const handleResize = () => {
      const containerWidth = containerRef.current!.clientWidth;
      const aspectRatio = height / width;
      const newHeight = containerWidth * aspectRatio;
      
      const newDimensions = createChartDimensions(
        containerWidth,
        newHeight,
        margin
      );
      setDimensions(newDimensions);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);
    handleResize(); // Initial call

    return () => resizeObserver.disconnect();
  }, [isResponsive, height, width, margin]);

  // Initialize visualization when SVG is ready
  useEffect(() => {
    if (!svgRef.current || !onVisualizationReady) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous content
    
    onVisualizationReady(svg, dimensions);
  }, [dimensions, onVisualizationReady]);

  const toggleResponsive = () => {
    setIsResponsive(!isResponsive);
    if (!isResponsive) {
      // Reset to original dimensions when turning off responsive mode
      setDimensions(createChartDimensions(width, height, margin));
    }
  };

  return (
    <div className={`visualization-container ${className}`}>
      <div className="visualization-header">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {description}
        </motion.p>
      </div>

      {controls && (
        <motion.div
          className="controls-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {controls}
        </motion.div>
      )}

      <motion.div
        className="visualization-content"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="chart-section">
          <div className="chart-header">
            <div className="chart-controls">
              <button
                className={`btn btn-sm ${isResponsive ? 'btn-primary' : 'btn-secondary'}`}
                onClick={toggleResponsive}
                title="Toggle responsive mode"
              >
                📱 Responsive
              </button>
            </div>
          </div>
          
          <div 
            ref={containerRef}
            className="chart-container"
            style={{ 
              width: isResponsive ? '100%' : `${dimensions.width}px`,
              height: `${dimensions.height}px`
            }}
          >
            <svg
              ref={svgRef}
              width={dimensions.width}
              height={dimensions.height}
              className="main-chart"
            />
            {children}
          </div>
        </div>

        {stats && stats.length > 0 && (
          <div className="stats-panel">
            <h3>Statistics</h3>
            <div className="stats-grid">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="stat-item"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                >
                  {stat.icon && <div className="stat-icon">{stat.icon}</div>}
                  <div className="stat-content">
                    <span className="stat-value">{stat.value}</span>
                    <span className="stat-label">{stat.label}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      <style>{`
        .visualization-content {
          display: flex;
          gap: 2rem;
          align-items: flex-start;
        }

        .chart-section {
          flex: 1;
          min-width: 0; /* Allows flex item to shrink */
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .chart-controls {
          display: flex;
          gap: 0.5rem;
        }

        .btn-sm {
          padding: 0.4rem 0.8rem;
          font-size: 0.8rem;
        }

        .chart-container {
          background: white;
          border-radius: 12px;
          padding: 1rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border: 1px solid #e9ecef;
          position: relative;
          overflow: hidden;
        }

        .main-chart {
          display: block;
          max-width: 100%;
          height: auto;
        }

        .stats-panel {
          min-width: 250px;
          background: #f8f9fa;
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid #e9ecef;
        }

        .stats-panel h3 {
          margin: 0 0 1rem 0;
          color: #333;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .stats-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          background: white;
          border-radius: 8px;
          border: 1px solid #e9ecef;
          transition: all 0.3s ease;
        }

        .stat-item:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transform: translateY(-1px);
        }

        .stat-icon {
          color: #667eea;
          flex-shrink: 0;
        }

        .stat-content {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .stat-value {
          font-weight: 700;
          color: #333;
          font-size: 1.1rem;
          line-height: 1.2;
        }

        .stat-label {
          font-size: 0.85rem;
          color: #666;
          line-height: 1.2;
        }

        /* Responsive adjustments */
        @media (max-width: 1024px) {
          .visualization-content {
            flex-direction: column;
          }

          .stats-panel {
            min-width: auto;
            width: 100%;
            order: -1;
          }

          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
          }
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 0.75rem;
          }

          .chart-container {
            padding: 0.75rem;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr 1fr;
          }

          .chart-container {
            padding: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default VisualizationBase;
