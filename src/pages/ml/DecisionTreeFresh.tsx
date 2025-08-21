import React, { useMemo, useState, useRef } from 'react';
import DecisionTreeViz from '../../components/DecisionTreeViz';
import { buildTreeStepwise, classify } from '../../utils/decisionTree';
import type { Sample, TreeNode } from '../../utils/decisionTree';

// Simple Iris-like toy dataset (3 classes, 4 numeric features) - reduced
const TOY_IRIS: Sample[] = [
  { features: [5.1, 3.5, 1.4, 0.2], label: 'setosa' },
  { features: [4.9, 3.0, 1.4, 0.2], label: 'setosa' },
  { features: [6.2, 3.4, 5.4, 2.3], label: 'virginica' },
  { features: [5.9, 3.0, 5.1, 1.8], label: 'virginica' },
  { features: [6.0, 2.2, 4.0, 1.0], label: 'versicolor' },
  { features: [5.5, 2.3, 4.0, 1.3], label: 'versicolor' },
  { features: [5.7, 2.8, 4.1, 1.3], label: 'versicolor' },
  { features: [5.4, 3.9, 1.7, 0.4], label: 'setosa' },
];

export default function DecisionTreeFresh() {
  const [mode, setMode] = useState<'read' | 'play'>('read');
  const [dataset, setDataset] = useState<Sample[]>(TOY_IRIS);
  const [maxDepth, setMaxDepth] = useState(3);
  const [minSamplesSplit, setMinSamplesSplit] = useState(2);

  const [events, setEvents] = useState<any[]>([]);
  const [root, setRoot] = useState<TreeNode | null>(null);
  const [highlightNodeId, setHighlightNodeId] = useState<number | null>(null);

  const stepperRef = useRef<Generator | null>(null);

  function startBuilding() {
    stepperRef.current = buildTreeStepwise(dataset, maxDepth, minSamplesSplit) as Generator;
    setEvents([]);
    setRoot(null);
    setHighlightNodeId(null);
  }

  function step() {
    if (!stepperRef.current) return;
    const res = stepperRef.current.next();
    if (res.done) {
      // find done event
      const doneEvent = res.value?.type === 'done' ? res.value : null;
      if (doneEvent) setRoot(doneEvent.root);
      return;
    }
    const ev = res.value;
    setEvents(prev => [...prev, ev]);
    if (ev.type === 'split') {
      // when split, we set root from the event's top-level node if available
      // the "queue" style generation yields nodes but we can reconstruct root by following parent links
      // simpler: when done is emitted we set root; until then, create a temporary root from first event's node chain
      // For visualization while stepping, we'll reconstruct a shallow tree by applying known splits to a root sample
      // quick approach: if first split event exists, make a root with left/right children
      // This is not a full reconstruction; final tree will be set on 'done'.
      const tempRoot: TreeNode = ev.node;
      tempRoot.left = ev.leftNode;
      tempRoot.right = ev.rightNode;
      setRoot({ ...tempRoot } as TreeNode);
      setHighlightNodeId(ev.node.id);
    } else if (ev.type === 'node_created') {
      // highlight this node
      setHighlightNodeId(ev.node.id);
    }
  }

  function runToEnd() {
    if (!stepperRef.current) return;
    let r = stepperRef.current.next();
    while (!r.done) {
      const ev = r.value;
      setEvents(prev => [...prev, ev]);
      r = stepperRef.current.next();
    }
    const doneEvent = r.value?.type === 'done' ? r.value : null;
    if (doneEvent) setRoot(doneEvent.root);
  }

  function reset() {
    stepperRef.current = null;
    setEvents([]);
    setRoot(null);
    setHighlightNodeId(null);
  }

  const sampleSummary = useMemo(() => {
    const counts: Record<string, number> = {};
    dataset.forEach(s => (counts[s.label] = (counts[s.label] || 0) + 1));
    return Object.entries(counts).map(([k, v]) => `${k}: ${v}`).join(' | ');
  }, [dataset]);

  // classifier test
  const [testPoint, setTestPoint] = useState<string>('5.8,3.0,4.3,1.3');
  const [classification, setClassification] = useState<string | null>(null);

  function classifyPoint() {
    if (!root) return;
    const nums = testPoint.split(',').map(s => parseFloat(s.trim()));
    const pred = classify(root, nums);
    setClassification(pred);
  }

  return (
    <div style={{ padding: 20, color: '#e6eef8' }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <button onClick={() => setMode('read')} style={{ padding: '6px 12px', background: mode === 'read' ? '#0b1220' : 'transparent', color: mode === 'read' ? '#fff' : '#e6eef8', borderRadius: 6, border: '1px solid rgba(255,255,255,0.06)' }}>Read</button>
        <button onClick={() => setMode('play')} style={{ padding: '6px 12px', background: mode === 'play' ? '#0b1220' : 'transparent', color: mode === 'play' ? '#fff' : '#e6eef8', borderRadius: 6, border: '1px solid rgba(255,255,255,0.06)' }}>Play</button>
      </div>

      {mode === 'read' && (
        <div>
          <h2>Decision Trees — Quick Overview</h2>
          <p>Decision trees partition the feature space into regions by asking a sequence of questions (splits). Each internal node chooses a feature and threshold which best separates the classes according to a purity metric (Gini impurity or entropy).</p>

          <h3>Gini impurity</h3>
          <p>Gini impurity for a node with class distribution p_k is: G = 1 - sum_k p_k^2</p>

          <h3>Information gain (for entropy)</h3>
          <p>Entropy: H = -sum_k p_k log p_k. Information gain compares parent entropy vs weighted child entropies.</p>

          <h3>How splits are chosen</h3>
          <p>For each feature, we consider thresholds between sorted values and compute the impurity of left/right partitions. The split with highest reduction in impurity (info gain) is chosen.</p>

          <h3>Example</h3>
          <p>Given toy points, the algorithm searches all candidate thresholds and picks the best one. Use Play mode to try it interactively and step through each split.</p>
        </div>
      )}

      {mode === 'play' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 12 }}>
          <div style={{ minHeight: 520, borderRadius: 8, background: 'rgba(255,255,255,0.03)', padding: 12, border: '1px solid rgba(255,255,255,0.04)' }}>
            <DecisionTreeViz rootNode={root} highlightNodeId={highlightNodeId} onNodeClick={(id) => setHighlightNodeId(id)} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ padding: 12, borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <h4 style={{ marginTop: 0, color: '#e6eef8' }}>Dataset</h4>
              <div style={{ marginBottom: 8, color: '#cbd5e1' }}>{sampleSummary}</div>
              <button onClick={() => setDataset(TOY_IRIS)} style={{ marginRight: 8, background: 'transparent', color: '#e6eef8', border: '1px solid rgba(255,255,255,0.06)', padding: '6px 8px', borderRadius: 6 }}>Load Toy Iris</button>
              <button onClick={() => setDataset([])} style={{ background: 'transparent', color: '#e6eef8', border: '1px solid rgba(255,255,255,0.06)', padding: '6px 8px', borderRadius: 6 }}>Clear</button>
            </div>

            <div style={{ padding: 12, borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <h4 style={{ marginTop: 0, color: '#e6eef8' }}>Parameters</h4>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <label style={{ color: '#cbd5e1' }}>Max Depth</label>
                <input type="number" value={maxDepth} onChange={e => setMaxDepth(Math.max(1, parseInt(e.target.value || '1')))} style={{ width: 80, background: 'transparent', color: '#e6eef8', border: '1px solid rgba(255,255,255,0.04)', padding: '4px 6px', borderRadius: 4 }} />
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
                <label style={{ color: '#cbd5e1' }}>Min Samples Split</label>
                <input type="number" value={minSamplesSplit} onChange={e => setMinSamplesSplit(Math.max(2, parseInt(e.target.value || '2')))} style={{ width: 80, background: 'transparent', color: '#e6eef8', border: '1px solid rgba(255,255,255,0.04)', padding: '4px 6px', borderRadius: 4 }} />
              </div>

              <div style={{ marginTop: 12 }}>
                <button onClick={startBuilding} style={{ marginRight: 8, background: 'transparent', color: '#e6eef8', border: '1px solid rgba(255,255,255,0.06)', padding: '6px 8px', borderRadius: 6 }}>Start</button>
                <button onClick={step} style={{ marginRight: 8, background: 'transparent', color: '#e6eef8', border: '1px solid rgba(255,255,255,0.06)', padding: '6px 8px', borderRadius: 6 }}>Step</button>
                <button onClick={runToEnd} style={{ marginRight: 8, background: 'transparent', color: '#e6eef8', border: '1px solid rgba(255,255,255,0.06)', padding: '6px 8px', borderRadius: 6 }}>Run to end</button>
                <button onClick={reset} style={{ background: 'transparent', color: '#e6eef8', border: '1px solid rgba(255,255,255,0.06)', padding: '6px 8px', borderRadius: 6 }}>Reset</button>
              </div>
            </div>

            <div style={{ padding: 12, borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <h4 style={{ marginTop: 0, color: '#e6eef8' }}>Events</h4>
              <div style={{ maxHeight: 220, overflow: 'auto', fontSize: 13 }}>
                {events.length === 0 && <div style={{ color: '#94a3b8' }}>No events yet. Click Start then Step.</div>}
                {events.map((ev, i) => (
                  <div key={i} style={{ padding: 6, borderBottom: '1px solid rgba(255,255,255,0.04)', color: '#e6eef8' }}>
                    <strong>{ev.type}</strong>
                    {ev.type === 'split' && (
                        <div>{`Split node #${ev.node.id} on f${ev.split.featureIndex} <= ${ev.split.threshold.toFixed(3)} (gain ${ev.split.infoGain.toFixed(4)})`}</div>
                      )}
                    {ev.type === 'node_created' && (
                      <div>Node #{ev.node.id} created (pred: {ev.node.prediction}, impurity: {ev.node.impurity?.toFixed(3)})</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: 12, borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <h4 style={{ marginTop: 0, color: '#e6eef8' }}>Classify</h4>
              <div style={{ marginBottom: 8, color: '#cbd5e1' }}>Enter comma-separated features (4 values):</div>
              <input value={testPoint} onChange={e => setTestPoint(e.target.value)} style={{ width: '100%', marginBottom: 8, background: 'transparent', color: '#e6eef8', border: '1px solid rgba(255,255,255,0.04)', padding: '6px 8px', borderRadius: 4 }} />
              <button onClick={classifyPoint} style={{ marginRight: 8, background: 'transparent', color: '#e6eef8', border: '1px solid rgba(255,255,255,0.06)', padding: '6px 8px', borderRadius: 6 }}>Classify</button>
              <div style={{ marginTop: 8, color: '#e6eef8' }}><strong>Prediction:</strong> {classification ?? '—'}</div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
