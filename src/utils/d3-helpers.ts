import * as d3 from 'd3';

export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ChartDimensions {
  width: number;
  height: number;
  margin: Margin;
  innerWidth: number;
  innerHeight: number;
}

export const createChartDimensions = (
  width: number, 
  height: number, 
  margin: Margin
): ChartDimensions => ({
  width,
  height,
  margin,
  innerWidth: width - margin.left - margin.right,
  innerHeight: height - margin.top - margin.bottom
});

export const createSvgContainer = (
  container: d3.Selection<any, any, any, any>,
  dimensions: ChartDimensions
) => {
  return container
    .append('svg')
    .attr('width', dimensions.width)
    .attr('height', dimensions.height);
};

export const createChartGroup = (
  svg: d3.Selection<any, any, any, any>,
  margin: Margin
) => {
  return svg
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);
};

export const addAxes = (
  chartGroup: d3.Selection<any, any, any, any>,
  xScale: d3.ScaleLinear<number, number>,
  yScale: d3.ScaleLinear<number, number>,
  dimensions: ChartDimensions,
  options: {
    xLabel?: string;
    yLabel?: string;
    xTickFormat?: (d: any) => string;
    yTickFormat?: (d: any) => string;
  } = {}
) => {
  // X axis
  const xAxis = chartGroup
    .append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${dimensions.innerHeight})`)
    .call(d3.axisBottom(xScale).tickFormat(options.xTickFormat || (d => d.toString())));

  // Y axis
  const yAxis = chartGroup
    .append('g')
    .attr('class', 'y-axis')
    .call(d3.axisLeft(yScale).tickFormat(options.yTickFormat || (d => d.toString())));

  // X axis label
  if (options.xLabel) {
    chartGroup
      .append('text')
      .attr('class', 'x-label')
      .attr('x', dimensions.innerWidth / 2)
      .attr('y', dimensions.innerHeight + 35)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#666')
      .text(options.xLabel);
  }

  // Y axis label
  if (options.yLabel) {
    chartGroup
      .append('text')
      .attr('class', 'y-label')
      .attr('transform', 'rotate(-90)')
      .attr('x', -dimensions.innerHeight / 2)
      .attr('y', -35)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#666')
      .text(options.yLabel);
  }

  return { xAxis, yAxis };
};

export const addGridLines = (
  chartGroup: d3.Selection<any, any, any, any>,
  xScale: d3.ScaleLinear<number, number>,
  yScale: d3.ScaleLinear<number, number>,
  dimensions: ChartDimensions
) => {
  // X grid lines
  chartGroup
    .append('g')
    .attr('class', 'grid x-grid')
    .attr('transform', `translate(0,${dimensions.innerHeight})`)
    .call(
      d3.axisBottom(xScale)
        .tickSize(-dimensions.innerHeight)
        .tickFormat(() => '')
    )
    .style('stroke-dasharray', '3,3')
    .style('opacity', 0.3);

  // Y grid lines
  chartGroup
    .append('g')
    .attr('class', 'grid y-grid')
    .call(
      d3.axisLeft(yScale)
        .tickSize(-dimensions.innerWidth)
        .tickFormat(() => '')
    )
    .style('stroke-dasharray', '3,3')
    .style('opacity', 0.3);
};

export const createTooltip = (container: HTMLElement) => {
  return d3.select(container)
    .append('div')
    .attr('class', 'tooltip')
    .style('position', 'absolute')
    .style('background', 'rgba(0, 0, 0, 0.8)')
    .style('color', 'white')
    .style('padding', '8px 12px')
    .style('border-radius', '4px')
    .style('font-size', '12px')
    .style('pointer-events', 'none')
    .style('opacity', 0)
    .style('z-index', 1000);
};

export const animateElements = (
  selection: d3.Selection<any, any, any, any>,
  duration: number = 500,
  delay: number = 0
) => {
  return selection
    .style('opacity', 0)
    .transition()
    .duration(duration)
    .delay(delay)
    .style('opacity', 1);
};

export const updateAxes = (
  xAxis: d3.Selection<any, any, any, any>,
  yAxis: d3.Selection<any, any, any, any>,
  xScale: d3.ScaleLinear<number, number>,
  yScale: d3.ScaleLinear<number, number>,
  duration: number = 300
) => {
  xAxis.transition().duration(duration).call(d3.axisBottom(xScale));
  yAxis.transition().duration(duration).call(d3.axisLeft(yScale));
};

// Color schemes for different visualizations
export const colorSchemes = {
  primary: '#667eea',
  secondary: '#764ba2',
  accent: '#ffd700',
  error: '#ff6b6b',
  success: '#4ecdc4',
  warning: '#feca57',
  info: '#45b7d1',
  categorical: [
    '#667eea', '#764ba2', '#ff6b6b', '#4ecdc4', 
    '#feca57', '#45b7d1', '#96ceb4', '#ff9ff3'
  ],
  sequential: d3.schemeBlues[9],
  diverging: d3.schemeRdYlBu[11]
};

// Common animation easing functions
export const easingFunctions = {
  linear: d3.easeLinear,
  quad: d3.easeQuad,
  cubic: d3.easeCubic,
  sin: d3.easeSin,
  exp: d3.easeExp,
  circle: d3.easeCircle,
  elastic: d3.easeElastic,
  back: d3.easeBack,
  bounce: d3.easeBounce
};

// Utility function to format numbers
export const formatNumber = (value: number, decimals: number = 2): string => {
  return value.toFixed(decimals);
};

// Utility function to create responsive scales
export const createResponsiveScale = (
  domain: [number, number],
  range: [number, number],
  padding: number = 0.1
) => {
  const paddedDomain = [
    domain[0] - (domain[1] - domain[0]) * padding,
    domain[1] + (domain[1] - domain[0]) * padding
  ];
  return d3.scaleLinear().domain(paddedDomain).range(range);
};

export default {
  createChartDimensions,
  createSvgContainer,
  createChartGroup,
  addAxes,
  addGridLines,
  createTooltip,
  animateElements,
  updateAxes,
  colorSchemes,
  easingFunctions,
  formatNumber,
  createResponsiveScale
};
