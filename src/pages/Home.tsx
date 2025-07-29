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
    <div className="home">
      <motion.div 
        className="hero-section"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="hero-content">
          <motion.div
            className="hero-icon"
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Brain size={80} />
            <Sparkles className="sparkle-1" size={20} />
            <Sparkles className="sparkle-2" size={16} />
          </motion.div>
          
          <h1 className="hero-title">
            Welcome to <span className="gradient-text">ExplainAI</span>
          </h1>
          
          <p className="hero-description">
            Interactive visualizations to understand Machine Learning and Large Language Models. 
            Learn complex AI concepts through hands-on exploration and real-time animations.
          </p>
          
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">8</span>
              <span className="stat-label">Interactive Demos</span>
            </div>
            <div className="stat">
              <span className="stat-number">2</span>
              <span className="stat-label">AI Categories</span>
            </div>
            <div className="stat">
              <span className="stat-number">∞</span>
              <span className="stat-label">Learning Possibilities</span>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.section 
        className="features-section"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="section-header" variants={itemVariants}>
          <h2>Traditional Machine Learning</h2>
          <p>Explore fundamental ML algorithms with interactive visualizations</p>
        </motion.div>
        
        <motion.div className="features-grid" variants={containerVariants}>
          {mlFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div key={index} variants={itemVariants}>
                <Link to={feature.path} className="feature-card">
                  <div className="feature-icon" style={{ backgroundColor: feature.color }}>
                    <Icon size={24} />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                  <div className="feature-arrow">
                    <ArrowRight size={16} />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.section>

      <motion.section 
        className="features-section"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="section-header" variants={itemVariants}>
          <h2>Large Language Models</h2>
          <p>Dive deep into the mechanics of modern language AI</p>
        </motion.div>
        
        <motion.div className="features-grid" variants={containerVariants}>
          {llmFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div key={index} variants={itemVariants}>
                <Link to={feature.path} className="feature-card">
                  <div className="feature-icon" style={{ backgroundColor: feature.color }}>
                    <Icon size={24} />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                  <div className="feature-arrow">
                    <ArrowRight size={16} />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.section>

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
