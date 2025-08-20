import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Menu, 
  X, 
  TrendingUp, 
  GitBranch, 
  Zap, 
  Network,
  Type,
  Eye,
  Layers,
  MessageSquare
} from 'lucide-react';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const mlRoutes = [
    { path: '/ml/linear-regression', name: 'Linear Regression', icon: TrendingUp },
    { path: '/ml/decision-tree', name: 'Decision Tree', icon: GitBranch },
    { path: '/ml/k-means', name: 'K-Means Clustering', icon: Zap },
    { path: '/ml/neural-network', name: 'Neural Network', icon: Network },
  ];

  const llmRoutes = [
    { path: '/llm/tokenization', name: 'Tokenization', icon: Type },
    { path: '/llm/attention', name: 'Attention Maps', icon: Eye },
    { path: '/llm/transformer', name: 'Transformer', icon: Layers },
    { path: '/llm/prompt-explorer', name: 'Prompt Explorer', icon: MessageSquare },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <Brain className="brand-icon" />
          <span className="brand-text">ExplainAI</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="nav-links desktop-nav">
          <div className="nav-section">
            <span className="nav-section-title">Traditional ML</span>
            <div className="nav-group">
              {mlRoutes.map((route) => {
                const Icon = route.icon;
                return (
                  <Link
                    key={route.path}
                    to={route.path}
                    className={`nav-link ${isActive(route.path) ? 'active' : ''}`}
                  >
                    <Icon size={16} />
                    <span>{route.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="nav-section">
            <span className="nav-section-title">Large Language Models</span>
            <div className="nav-group">
              {llmRoutes.map((route) => {
                const Icon = route.icon;
                return (
                  <Link
                    key={route.path}
                    to={route.path}
                    className={`nav-link ${isActive(route.path) ? 'active' : ''}`}
                  >
                    <Icon size={16} />
                    <span>{route.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="mobile-nav"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mobile-nav-content">
              <div className="nav-section">
                <span className="nav-section-title">Traditional ML</span>
                <div className="nav-group">
                  {mlRoutes.map((route) => {
                    const Icon = route.icon;
                    return (
                      <Link
                        key={route.path}
                        to={route.path}
                        className={`nav-link ${isActive(route.path) ? 'active' : ''}`}
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon size={16} />
                        <span>{route.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="nav-section">
                <span className="nav-section-title">Large Language Models</span>
                <div className="nav-group">
                  {llmRoutes.map((route) => {
                    const Icon = route.icon;
                    return (
                      <Link
                        key={route.path}
                        to={route.path}
                        className={`nav-link ${isActive(route.path) ? 'active' : ''}`}
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon size={16} />
                        <span>{route.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .navigation {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        .nav-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
          color: white;
          font-weight: bold;
          font-size: 1.5rem;
        }

        .brand-icon {
          color: #ffd700;
        }

        .desktop-nav {
          display: flex;
          gap: 3rem;
        }

        .nav-section {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .nav-section-title {
          font-size: 0.8rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.7);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .nav-group {
          display: flex;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          text-decoration: none;
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.9rem;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .nav-link:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          transform: translateY(-1px);
        }

        .nav-link.active {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 8px;
          transition: background 0.3s ease;
        }

        .mobile-menu-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .mobile-nav {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          overflow: hidden;
        }

        .mobile-nav-content {
          padding: 1rem 2rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .mobile-nav .nav-group {
          flex-direction: column;
          gap: 0.5rem;
        }

        @media (max-width: 768px) {
          .desktop-nav {
            display: none;
          }

          .mobile-menu-btn {
            display: block;
          }

          .nav-container {
            padding: 1rem;
          }
        }

        @media (max-width: 1024px) {
          .nav-group {
            gap: 0.5rem;
          }

          .nav-link {
            padding: 0.4rem 0.8rem;
            font-size: 0.8rem;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navigation;
