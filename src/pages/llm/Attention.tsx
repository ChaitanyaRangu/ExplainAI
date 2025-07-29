import { motion } from 'framer-motion';
import { Eye, Construction } from 'lucide-react';

const Attention = () => {
  return (
    <div className="visualization-container">
      <div className="visualization-header">
        <h1>Attention Mechanism Visualizer</h1>
        <p>Explore how attention helps models focus on relevant information - Coming Soon!</p>
      </div>

      <motion.div 
        className="coming-soon"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="coming-soon-content">
          <Construction size={64} className="construction-icon" />
          <h2>Under Construction</h2>
          <p>
            This visualization will show attention weights and how different parts
            of the input influence the model's predictions through interactive heatmaps.
          </p>
          
          <div className="features-preview">
            <h3>Coming Features:</h3>
            <ul>
              <li><Eye size={16} /> Interactive attention heatmaps</li>
              <li><Eye size={16} /> Multi-head attention visualization</li>
              <li><Eye size={16} /> Self-attention vs cross-attention</li>
              <li><Eye size={16} /> Real-time attention weight updates</li>
            </ul>
          </div>
        </div>
      </motion.div>

      <style jsx>{`
        .coming-soon {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
          text-align: center;
        }

        .coming-soon-content {
          max-width: 500px;
          padding: 2rem;
        }

        .construction-icon {
          color: #ffd700;
          margin-bottom: 1rem;
        }

        .coming-soon-content h2 {
          font-size: 2rem;
          margin-bottom: 1rem;
          color: #333;
        }

        .coming-soon-content p {
          font-size: 1.1rem;
          color: #666;
          line-height: 1.6;
          margin-bottom: 2rem;
        }

        .features-preview {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 1.5rem;
          text-align: left;
        }

        .features-preview h3 {
          color: #333;
          margin-bottom: 1rem;
          text-align: center;
        }

        .features-preview ul {
          list-style: none;
          padding: 0;
        }

        .features-preview li {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0;
          color: #495057;
        }
      `}</style>
    </div>
  );
};

export default Attention;
