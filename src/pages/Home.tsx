import React, { useState, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Brain, 
  TrendingUp, 
  GitBranch, 
  Zap, 
  Network,
  Type,
  Eye,
  Layers,
  MessageSquare,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const Home = () => {
  // Mode state
  const [mode, setMode] = useState<'explain' | 'read'>('explain');
  // Split screen state
  const [compare, setCompare] = useState(false);
  const [selectedModel1, setSelectedModel1] = useState<string>('');
  const [selectedModel2, setSelectedModel2] = useState<string>('');
  // Which pane is active when assigning models in compare mode (1 = left/main, 2 = right)
  const [activePane, setActivePane] = useState<1 | 2>(1);
  // Search state
  const [search, setSearch] = useState('');
  // Per-model mode overrides (allows toggling read/explain per selected model)
  const [perModelMode, setPerModelMode] = useState<Record<string, 'explain' | 'read'>>({});
  // Lazy-loaded visualization components map
  // ...componentMap and renderFeatureContent will be defined below after feature arrays
  const mlFeatures = [
    {
      icon: TrendingUp,
      title: 'Linear Regression',
      description: 'Visualize how linear regression finds the best fit line through data points',
      path: '/ml/linear-regression',
      color: '#ff6b6b'
    },
    {
      icon: GitBranch,
      title: 'Decision Trees',
      description: 'Watch decision trees split data and make predictions step by step',
      path: '/ml/decision-tree',
      color: '#4ecdc4'
    },
    {
      icon: Zap,
      title: 'K-Means Clustering',
      description: 'See how K-means algorithm groups similar data points together',
      path: '/ml/k-means',
      color: '#45b7d1'
    },
    {
      icon: Network,
      title: 'Neural Networks',
      description: 'Explore how neural networks learn through forward and backward propagation',
      path: '/ml/neural-network',
      color: '#96ceb4'
    }
  ];

  const llmFeatures = [
    {
      icon: Type,
      title: 'Tokenization',
      description: 'Understand how text is broken down into tokens for language models',
      path: '/llm/tokenization',
      color: '#feca57'
    },
    {
      icon: Eye,
      title: 'Attention Mechanisms',
      description: 'Visualize how attention helps models focus on relevant parts of input',
      path: '/llm/attention',
      color: '#ff9ff3'
    },
    {
      icon: Layers,
      title: 'Transformer Architecture',
      description: 'Explore the transformer architecture that powers modern LLMs',
      path: '/llm/transformer',
      color: '#54a0ff'
    },
    {
      icon: MessageSquare,
      title: 'Prompt Engineering',
      description: 'Experiment with prompts and see how they affect model responses',
      path: '/llm/prompt-explorer',
      color: '#5f27cd'
    }
  ];

  // Lazy-loaded visualization components map
  const componentMap: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
  '/ml/linear-regression': lazy(() => import('./ml/LinearRegressionFresh')),
  '/ml/decision-tree': lazy(() => import('./ml/DecisionTreeFresh')),
    '/ml/k-means': lazy(() => import('./ml/KMeans')),
    '/ml/neural-network': lazy(() => import('./ml/NeuralNetwork')),
    '/llm/attention': lazy(() => import('./llm/Attention')),
    '/llm/prompt-explorer': lazy(() => import('./llm/PromptExplorer')),
    '/llm/tokenization': lazy(() => import('./llm/Tokenization')),
    '/llm/transformer': lazy(() => import('./llm/Transformer')),
  };

  const allFeatures = [...mlFeatures, ...llmFeatures];

  const renderFeatureContent = (path?: string, overrideMode?: 'explain' | 'read') => {
    if (!path) return <div style={{ color: '#666' }}>No model selected</div>;
    const feature = allFeatures.find(f => f.path === path);
    const Comp = componentMap[path];
    const effectiveMode = overrideMode || mode;

    if (effectiveMode === 'read') {
      return (
        <div style={{ padding: '1rem' }}>
          <h3 style={{ marginTop: 0 }}>{feature?.title}</h3>
          <p style={{ color: '#333' }}>{feature?.description}</p>
          <p style={{ color: '#444' }}>This read mode provides a clear textual explanation and examples for beginners. You can expand this content per model to include intuition, math, and step-by-step walkthroughs.</p>
        </div>
      );
    }

    if (Comp) {
      return (
        <Suspense fallback={<div style={{ padding: '1rem' }}>Loading visualization...</div>}>
          <div style={{ height: 400, overflow: 'auto' }}>
            <Comp />
          </div>
        </Suspense>
      );
    }

    return <div style={{ color: '#666' }}>Visualization not available for this model yet.</div>;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="home" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg, #071032 0%, #081726 50%, #0b1222 100%)', backgroundSize: 'cover', backgroundRepeat: 'no-repeat' }}>

      {/* Header (reintroduced) */}
      <header style={{ width: '100%', padding: '1rem 1.5rem', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'transparent' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Brain size={32} color="#ffd700" />
          <h1 style={{ margin: 0, color: '#fff', fontSize: 20 }}>ExplainAI</h1>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search models..."
            style={{ padding: '0.5rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.04)', color: '#fff' }}
          />
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setMode('explain')} style={{ padding: '0.5rem 0.75rem', borderRadius: 8, background: mode === 'explain' ? '#667eea' : 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' }}>Explain</button>
            <button onClick={() => setMode('read')} style={{ padding: '0.5rem 0.75rem', borderRadius: 8, background: mode === 'read' ? '#667eea' : 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' }}>Read</button>
            <button onClick={() => setCompare(c => !c)} style={{ padding: '0.5rem 0.75rem', borderRadius: 8, background: compare ? '#ffd700' : 'transparent', color: '#111', border: '1px solid rgba(255,255,255,0.08)' }}>{compare ? 'Compare ON' : 'Compare'}</button>
          </div>
        </div>
      </header>

      {/* Responsive container: sidebar (model list) on large screens, stacked on small */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, margin: '1rem auto', maxWidth: 1400, padding: '0 1rem', boxSizing: 'border-box', flex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'row', gap: 20 }}>
          {/* Sidebar: becomes fixed-width column on large screens */}
          <aside style={{ flex: '0 0 320px', minWidth: 220, background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(6px)', borderRadius: 12, padding: 16, boxShadow: '0 8px 30px rgba(2,6,23,0.6)', color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontWeight: 700 }}>Models</div>
              {compare && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button onClick={() => setActivePane(1)} style={{ padding: '6px 8px', borderRadius: 6, border: activePane === 1 ? '2px solid #667eea' : '1px solid #eee', background: activePane === 1 ? '#eef2ff' : '#fff' }}>Left</button>
                  <button onClick={() => setActivePane(2)} style={{ padding: '6px 8px', borderRadius: 6, border: activePane === 2 ? '2px solid #667eea' : '1px solid #eee', background: activePane === 2 ? '#eef2ff' : '#fff' }}>Right</button>
                </div>
              )}
            </div>

            {/* Mode toggle moved into sidebar for compact layout */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <button
                onClick={() => setMode('explain')}
                style={{ flex: 1, padding: '0.5rem', borderRadius: 8, background: mode === 'explain' ? '#667eea' : '#f3f4f6', color: mode === 'explain' ? '#fff' : '#333', border: 'none', fontWeight: 600 }}
              >Explain</button>
              <button
                onClick={() => setMode('read')}
                style={{ flex: 1, padding: '0.5rem', borderRadius: 8, background: mode === 'read' ? '#667eea' : '#f3f4f6', color: mode === 'read' ? '#fff' : '#333', border: 'none', fontWeight: 600 }}
              >Read</button>
              <button
                onClick={() => setCompare(c => !c)}
                style={{ padding: '0.5rem', borderRadius: 8, background: compare ? '#ffd700' : 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.04)', color: compare ? '#111' : '#fff', fontWeight: 600 }}
              >{compare ? 'Compare ON' : 'Compare'}</button>
            </div>

            {/* Search inside sidebar to filter models */}
            <div style={{ marginBottom: 12 }}>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Filter models..."
                style={{ width: '100%', padding: '0.5rem', borderRadius: 8, border: '1px solid #eee' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '60vh', overflow: 'auto', paddingRight: 4 }}>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>Machine Learning</div>
              {[...mlFeatures].filter(f => f.title.toLowerCase().includes(search.toLowerCase())).map(feature => {
                const isSelected = selectedModel1 === feature.path || selectedModel2 === feature.path;
                return (
                <div key={feature.path} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {!isSelected ? (
                    <button
                      onClick={() => {
                        if (compare) {
                          activePane === 1 ? setSelectedModel1(feature.path) : setSelectedModel2(feature.path);
                        } else {
                          setSelectedModel1(feature.path);
                        }
                      }}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)', background: 'transparent', cursor: 'pointer', textAlign: 'left', fontWeight: 600, color: '#fff', width: '100%' }}
                    >
                      <span style={{ background: feature.color, borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <feature.icon size={16} />
                      </span>
                      <div>{feature.title}</div>
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <div style={{ padding: '6px 10px', borderRadius: 20, background: 'rgba(102,126,234,0.15)', border: '1px solid rgba(102,126,234,0.25)', color: '#fff', fontWeight: 700 }}>{feature.title}</div>
                      <button onClick={() => setPerModelMode(prev => ({ ...prev, [feature.path]: prev[feature.path] === 'read' ? 'explain' : 'read' }))} style={{ padding: '6px 8px', borderRadius: 8, border: 'none' }}>{perModelMode[feature.path] === 'read' ? 'Read' : 'Explain'}</button>
                    </div>
                  )}
                </div>
                );
              })}

              <div style={{ height: 10 }} />
              <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>Large Language Models</div>
              {[...llmFeatures].filter(f => f.title.toLowerCase().includes(search.toLowerCase())).map(feature => {
                const isSelected = selectedModel1 === feature.path || selectedModel2 === feature.path;
                return (
                <div key={feature.path} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {!isSelected ? (
                    <button
                      onClick={() => {
                        if (compare) {
                          activePane === 1 ? setSelectedModel1(feature.path) : setSelectedModel2(feature.path);
                        } else {
                          setSelectedModel1(feature.path);
                        }
                      }}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)', background: 'transparent', cursor: 'pointer', textAlign: 'left', fontWeight: 600, color: '#fff', width: '100%' }}
                    >
                      <span style={{ background: feature.color, borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <feature.icon size={16} />
                      </span>
                      <div>{feature.title}</div>
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <div style={{ padding: '6px 10px', borderRadius: 20, background: 'rgba(102,126,234,0.15)', border: '1px solid rgba(102,126,234,0.25)', color: '#fff', fontWeight: 700 }}>{feature.title}</div>
                      <button onClick={() => setPerModelMode(prev => ({ ...prev, [feature.path]: prev[feature.path] === 'read' ? 'explain' : 'read' }))} style={{ padding: '6px 8px', borderRadius: 8, border: 'none' }}>{perModelMode[feature.path] === 'read' ? 'Read' : 'Explain'}</button>
                    </div>
                  )}
                </div>
                );
              })}
            </div>
          </aside>

          {/* Main visualization area */}
          <main style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', gap: 20, flexDirection: compare ? 'row' : 'column' }}>
              {!compare && (
                <div style={{ flex: 1, minHeight: 420, background: 'rgba(255,255,255,0.02)', borderRadius: 12, padding: 16, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)' }}>
                  {renderFeatureContent(selectedModel1, perModelMode[selectedModel1])}
                </div>
              )}

              {compare && (
                <>
                  <div style={{ flex: 1, minHeight: 420, background: 'rgba(255,255,255,0.02)', borderRadius: 12, padding: 12, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)' }}>
                    {renderFeatureContent(selectedModel1, perModelMode[selectedModel1])}
                  </div>
                  <div style={{ flex: 1, minHeight: 420, background: 'rgba(255,255,255,0.02)', borderRadius: 12, padding: 12, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)' }}>
                    {renderFeatureContent(selectedModel2, perModelMode[selectedModel2])}
                  </div>
                </>
              )}
            </div>
          </main>
        </div>
      </div>

      <style>{`
        .home {
          min-height: 100vh;
        }

        .hero-section {
          text-align: center;
          padding: 4rem 0 6rem;
          position: relative;
        }

        .hero-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .hero-icon {
          position: relative;
          display: inline-block;
          margin-bottom: 2rem;
          color: #ffd700;
        }

        .sparkle-1, .sparkle-2 {
          position: absolute;
          color: #fff;
          animation: sparkle 2s infinite ease-in-out;
        }

        .sparkle-1 {
          top: -10px;
          right: -10px;
          animation-delay: 0s;
        }

        .sparkle-2 {
          bottom: -5px;
          left: -15px;
          animation-delay: 1s;
        }

        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          margin-bottom: 1.5rem;
          line-height: 1.2;
        }

        .gradient-text {
          background: linear-gradient(135deg, #ffd700, #ffed4e);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-description {
          font-size: 1.3rem;
          line-height: 1.6;
          margin-bottom: 3rem;
          color: rgba(255, 255, 255, 0.9);
        }

        .hero-stats {
          display: flex;
          justify-content: center;
          gap: 3rem;
          margin-top: 3rem;
        }

        .stat {
          text-align: center;
        }

        .stat-number {
          display: block;
          font-size: 2.5rem;
          font-weight: 800;
          color: #ffd700;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.8);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .features-section {
          margin-bottom: 4rem;
        }

        .section-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .section-header h2 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .section-header p {
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.8);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .feature-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          padding: 2rem;
          text-decoration: none;
          color: white;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          background: rgba(255, 255, 255, 0.15);
        }

        .feature-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
          color: white;
        }

        .feature-card h3 {
          font-size: 1.4rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .feature-card p {
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .feature-arrow {
          position: absolute;
          bottom: 1.5rem;
          right: 1.5rem;
          opacity: 0.6;
          transition: all 0.3s ease;
        }

        .feature-card:hover .feature-arrow {
          opacity: 1;
          transform: translateX(4px);
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }

          .hero-description {
            font-size: 1.1rem;
          }

          .hero-stats {
            gap: 2rem;
          }

          .features-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .feature-card {
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
