import { motion } from 'framer-motion';
import { MessageSquare, Construction } from 'lucide-react';

const PromptExplorer = () => {
  return (
    <div className="visualization-container">
      <div className="visualization-header">
        <h1>Prompt Explorer</h1>
        <p>Experiment with prompts and see how they affect model responses - Coming Soon!</p>
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
            This tool will let you experiment with different prompting techniques
            and see how small changes in wording can dramatically affect model outputs.
          </p>
          
          <div className="features-preview">
            <h3>Coming Features:</h3>
            <ul>
              <li><MessageSquare size={16} /> Interactive prompt editor</li>
              <li><MessageSquare size={16} /> Response probability visualization</li>
              <li><MessageSquare size={16} /> Prompt engineering techniques</li>
              <li><MessageSquare size={16} /> A/B testing for prompts</li>
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

export default PromptExplorer;
