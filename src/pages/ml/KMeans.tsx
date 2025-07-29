import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as d3 from 'd3';
import { Play, Pause, RotateCcw, Plus, Shuffle, Target } from 'lucide-react';
import VisualizationBase from '../../components/VisualizationBase';
import { colorSchemes, createResponsiveScale, ChartDimensions } from '../../utils/d3-helpers';

interface DataPoint {
  x: number;
  y: number;
  cluster: number;
  id: number;
}

interface Centroid {
  x: number;
  y: number;
  id: number;
}

const KMeans = () => {
  const [data, setData] = useState<DataPoint[]>([]);
  const [centroids, setCentroids] = useState<Centroid[]>([]);
  const [k, setK] = useState(3);
  const [isAnimating, setIsAnimating] = useState(false);
  const [iteration, setIteration] = useState(0);
  const [converged, setConverged] = useState(false);
  const [initMethod, setInitMethod] = useState<'random' | 'kmeans++'>('random');

  const animationRef = useRef<number>();
  const svgRef = useRef<d3.Selection<SVGSVGElement, unknown, null, undefined>>();
  const dimensionsRef = useRef<ChartDimensions>();

  // Generate initial random data
  const generateRandomData = (count: number = 50) => {
    const newData: DataPoint[] = [];

    // Create some clusters for more interesting visualization
    const clusterCenters = [
      { x: 2, y: 2 }, { x: 7, y: 3 }, { x: 4, y: 7 }, { x: 8, y: 8 }
    ];

    for (let i = 0; i < count; i++) {
      const center = clusterCenters[Math.floor(Math.random() * clusterCenters.length)];
      const point: DataPoint = {
        x: center.x + (Math.random() - 0.5) * 3,
        y: center.y + (Math.random() - 0.5) * 3,
        cluster: -1,
        id: i
      };
      newData.push(point);
    }

    setData(newData);
    setIteration(0);
    setConverged(false);
  };

  // Initialize centroids
  const initializeCentroids = (method: 'random' | 'kmeans++' = 'random') => {
    if (data.length === 0) return;

    const newCentroids: Centroid[] = [];

    if (method === 'random') {
      for (let i = 0; i < k; i++) {
        newCentroids.push({
          x: Math.random() * 10,
          y: Math.random() * 10,
          id: i
        });
      }
    } else {
      // K-means++ initialization
      // First centroid is random
      const firstPoint = data[Math.floor(Math.random() * data.length)];
      newCentroids.push({ x: firstPoint.x, y: firstPoint.y, id: 0 });

      // Subsequent centroids chosen with probability proportional to squared distance
      for (let i = 1; i < k; i++) {
        const distances = data.map(point => {
          const minDist = Math.min(...newCentroids.map(centroid =>
            Math.pow(point.x - centroid.x, 2) + Math.pow(point.y - centroid.y, 2)
          ));
          return minDist;
        });

        const totalDist = distances.reduce((sum, d) => sum + d, 0);
        let random = Math.random() * totalDist;

        for (let j = 0; j < data.length; j++) {
          random -= distances[j];
          if (random <= 0) {
            newCentroids.push({ x: data[j].x, y: data[j].y, id: i });
            break;
          }
        }
      }
    }

    setCentroids(newCentroids);
    setIteration(0);
    setConverged(false);
  };

  // Assign points to nearest centroid
  const assignClusters = () => {
    const newData = data.map(point => {
      let minDistance = Infinity;
      let nearestCluster = 0;

      centroids.forEach((centroid, index) => {
        const distance = Math.sqrt(
          Math.pow(point.x - centroid.x, 2) + Math.pow(point.y - centroid.y, 2)
        );
        if (distance < minDistance) {
          minDistance = distance;
          nearestCluster = index;
        }
      });

      return { ...point, cluster: nearestCluster };
    });

    setData(newData);
    return newData;
  };

  // Update centroid positions
  const updateCentroids = (clusteredData: DataPoint[]) => {
    const newCentroids = centroids.map((centroid, index) => {
      const clusterPoints = clusteredData.filter(point => point.cluster === index);

      if (clusterPoints.length === 0) {
        return centroid; // Keep centroid in place if no points assigned
      }

      const newX = clusterPoints.reduce((sum, point) => sum + point.x, 0) / clusterPoints.length;
      const newY = clusterPoints.reduce((sum, point) => sum + point.y, 0) / clusterPoints.length;

      return { ...centroid, x: newX, y: newY };
    });

    // Check for convergence
    const hasConverged = newCentroids.every((newCentroid, index) => {
      const oldCentroid = centroids[index];
      const distance = Math.sqrt(
        Math.pow(newCentroid.x - oldCentroid.x, 2) +
        Math.pow(newCentroid.y - oldCentroid.y, 2)
      );
      return distance < 0.01; // Convergence threshold
    });

    setCentroids(newCentroids);
    setConverged(hasConverged);

    return hasConverged;
  };

  // Single iteration of K-means
  const performIteration = () => {
    const clusteredData = assignClusters();
    const hasConverged = updateCentroids(clusteredData);
    setIteration(prev => prev + 1);

    if (hasConverged) {
      setIsAnimating(false);
    }

    return hasConverged;
  };

  // Animation loop
  const animate = () => {
    if (!isAnimating || converged) {
      setIsAnimating(false);
      return;
    }

    performIteration();

    setTimeout(() => {
      animationRef.current = requestAnimationFrame(animate);
    }, 1000); // 1 second delay between iterations
  };

  // Control functions
  const toggleAnimation = () => {
    if (centroids.length === 0) {
      initializeCentroids(initMethod);
    }
    setIsAnimating(!isAnimating);
  };

  const reset = () => {
    setIsAnimating(false);
    setIteration(0);
    setConverged(false);
    setCentroids([]);
    setData(prev => prev.map(point => ({ ...point, cluster: -1 })));
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const addRandomPoint = () => {
    const newPoint: DataPoint = {
      x: Math.random() * 10,
      y: Math.random() * 10,
      cluster: -1,
      id: data.length
    };
    setData([...data, newPoint]);
  };

  // Initialize data on component mount
  useEffect(() => {
    generateRandomData();
  }, []);

  // Handle animation
  useEffect(() => {
    if (isAnimating && !converged) {
      animationRef.current = requestAnimationFrame(animate);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnimating, converged]);

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

    const xScale = createResponsiveScale([0, 10], [0, dimensions.innerWidth]);
    const yScale = createResponsiveScale([0, 10], [dimensions.innerHeight, 0]);

    const chartGroup = svg
      .append('g')
      .attr('transform', `translate(${dimensions.margin.left},${dimensions.margin.top})`);

    // Add axes
    chartGroup.append('g')
      .attr('transform', `translate(0,${dimensions.innerHeight})`)
      .call(d3.axisBottom(xScale));

    chartGroup.append('g')
      .call(d3.axisLeft(yScale));

    // Add data points
    chartGroup.selectAll('.data-point')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'data-point')
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.y))
      .attr('r', 4)
      .attr('fill', d => d.cluster >= 0 ? colorSchemes.categorical[d.cluster % colorSchemes.categorical.length] : '#999')
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .style('opacity', 0.8);

    // Add centroids
    chartGroup.selectAll('.centroid')
      .data(centroids)
      .enter()
      .append('circle')
      .attr('class', 'centroid')
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.y))
      .attr('r', 8)
      .attr('fill', (d, i) => colorSchemes.categorical[i % colorSchemes.categorical.length])
      .attr('stroke', '#333')
      .attr('stroke-width', 3);

    // Add centroid labels
    chartGroup.selectAll('.centroid-label')
      .data(centroids)
      .enter()
      .append('text')
      .attr('class', 'centroid-label')
      .attr('x', d => xScale(d.x))
      .attr('y', d => yScale(d.y) + 4)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .text((d, i) => `C${i + 1}`);
  };

  // Update visualization when data changes
  useEffect(() => {
    updateVisualization();
  }, [data, centroids]);

  const controls = (
    <>
      <div className="controls-grid">
        <div className="control-group">
          <label>Number of Clusters (K): {k}</label>
          <input
            type="range"
            min="2"
            max="8"
            value={k}
            onChange={(e) => {
              setK(parseInt(e.target.value));
              reset();
            }}
          />
        </div>

        <div className="control-group">
          <label>Initialization Method</label>
          <select
            value={initMethod}
            onChange={(e) => setInitMethod(e.target.value as any)}
            className="select-input"
          >
            <option value="random">Random</option>
            <option value="kmeans++">K-means++</option>
          </select>
        </div>
      </div>

      <div className="button-group">
        <button
          className={`btn ${isAnimating ? 'btn-secondary' : 'btn-primary'}`}
          onClick={toggleAnimation}
          disabled={converged}
        >
          {isAnimating ? <Pause size={16} /> : <Play size={16} />}
          {isAnimating ? 'Pause' : 'Start'} Clustering
        </button>

        <button className="btn btn-secondary" onClick={reset}>
          <RotateCcw size={16} />
          Reset
        </button>

        <button className="btn btn-secondary" onClick={() => generateRandomData()}>
          <Shuffle size={16} />
          New Data
        </button>

        <button className="btn btn-secondary" onClick={addRandomPoint}>
          <Plus size={16} />
          Add Point
        </button>

        <button
          className="btn btn-primary"
          onClick={() => initializeCentroids(initMethod)}
        >
          <Target size={16} />
          Initialize Centroids
        </button>
      </div>
    </>
  );

  const stats = [
    { label: 'Iteration', value: iteration, icon: <Target size={16} /> },
    { label: 'Data Points', value: data.length, icon: <Plus size={16} /> },
    { label: 'Clusters (K)', value: k, icon: <Shuffle size={16} /> },
    { label: 'Status', value: converged ? 'Converged' : isAnimating ? 'Running' : 'Stopped', icon: <Play size={16} /> }
  ];

  return (
    <VisualizationBase
      title="K-Means Clustering"
      description="Watch the K-means algorithm group similar data points into clusters"
      controls={controls}
      stats={stats}
      onVisualizationReady={handleVisualizationReady}
      width={600}
      height={400}
    />
  );
};

export default KMeans;
