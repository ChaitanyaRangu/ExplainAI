import React, { useMemo, useState } from 'react';
import Plot from 'react-plotly.js';
import { fitLeastSquares, mse, r2, residuals, predict } from '../../utils/linearRegression';
import type { Point } from '../../utils/linearRegression';

// Example dataset
const exampleData: Point[] = [
  { x: 1, y: 2 },
  { x: 2, y: 4 },
  { x: 3, y: 3 },
  { x: 4, y: 6 },
  { x: 5, y: 5 },
  { x: 6, y: 7 },
  { x: 7, y: 8 },
  { x: 8, y: 9 }
];

const LinearRegressionFresh: React.FC = () => {
  const [points, setPoints] = useState<Point[]>(exampleData);
  const optimal = useMemo(() => fitLeastSquares(points), [points]);

  const [m, setM] = useState<number>(optimal.m || 1);
  const [b, setB] = useState<number>(optimal.b || 0);
  const [mode, setMode] = useState<'read' | 'play'>('play');

  const line = useMemo(() => predict(points, m, b), [points, m, b]);
  const metrics = useMemo(() => ({ mse: mse(points, m, b), r2: r2(points, m, b) }), [points, m, b]);
  const resids = useMemo(() => residuals(points, m, b), [points, m, b]);

  const fitAuto = () => {
    const opt = fitLeastSquares(points);
    setM(opt.m);
    setB(opt.b);
  };

  const addPoint = (x?: number, y?: number) => {
    const nx = x ?? +(Math.random() * 10).toFixed(2);
    const ny = y ?? +(Math.random() * 10).toFixed(2);
    setPoints(prev => [...prev, { x: nx, y: ny }]);
  };

  return (
    <div style={{ padding: 20, color: '#111' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>Linear Regression</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setMode('read')} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #ddd' }}>Read Mode</button>
          <button onClick={() => setMode('play')} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #ddd' }}>Play Mode</button>
        </div>
      </div>

      {mode === 'read' ? (
        <div>
          <h3>What is Linear Regression?</h3>
          <p>Linear regression fits a line y = m x + b that minimizes squared error.</p>
          <h4>Equations</h4>
          <p>Slope m = (n Σxy - Σx Σy) / (n Σx^2 - (Σx)^2)</p>
          <p>Intercept b = (Σy - m Σx) / n</p>
          <h4>Metrics</h4>
          <p>MSE = mean((y - (m x + b))^2)</p>
          <p>R² = 1 - SS_res / SS_tot</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: 16, alignItems: 'start' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ height: 540 }}>
              <Plot
                data={[
                  { x: points.map(p => p.x), y: points.map(p => p.y), mode: 'markers', type: 'scatter', marker: { color: '#1f77b4' }, name: 'Data' },
                  { x: line.map(p => p.x), y: line.map(p => p.y), mode: 'lines', type: 'scatter', line: { color: '#ff7f0e' }, name: 'Line' }
                ]}
                useResizeHandler={true}
                style={{ width: '100%', height: '100%' }}
                layout={{ autosize: true, height: 540, margin: { t: 20, l: 50, r: 10, b: 40 }, xaxis: { title: 'X' }, yaxis: { title: 'Y' } }}
              />
            </div>

            <div style={{ marginTop: 10 }}>
              <strong>Residuals</strong>
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {resids.map((r, i) => (
                  <li key={i}>x={r.x}, resid={r.resid.toFixed(2)}</li>
                ))}
              </ul>
            </div>
          </div>

          <aside style={{ background: '#fff', padding: 16, borderRadius: 8 }}>
            <div style={{ marginBottom: 8 }}>
              <label>Slope (m): {m.toFixed(3)}</label>
              <input type="range" min="-5" max="5" step="0.01" value={m} onChange={e => setM(parseFloat(e.target.value))} />
            </div>

            <div style={{ marginBottom: 8 }}>
              <label>Intercept (b): {b.toFixed(3)}</label>
              <input type="range" min="-10" max="10" step="0.01" value={b} onChange={e => setB(parseFloat(e.target.value))} />
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={fitAuto} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd' }}>Fit Automatically</button>
              <button onClick={() => addPoint()} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd' }}>Add Point</button>
            </div>

            <div style={{ marginTop: 12 }}>
              <div>MSE: {metrics.mse.toFixed(3)}</div>
              <div>R²: {metrics.r2.toFixed(3)}</div>
              <div>Points: {points.length}</div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default LinearRegressionFresh;
