import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import LinearRegression from './pages/ml/LinearRegressionFresh';
import DecisionTree from './pages/ml/DecisionTreeFresh';
import KMeans from './pages/ml/KMeans';
import NeuralNetwork from './pages/ml/NeuralNetwork';
import Tokenization from './pages/llm/Tokenization';
import Attention from './pages/llm/Attention';
import Transformer from './pages/llm/Transformer';
import PromptExplorer from './pages/llm/PromptExplorer';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <motion.main
          className="main-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Routes>
            <Route path="/" element={<Home />} />

            {/* ML Traditional Models */}
            <Route path="/ml/linear-regression" element={<LinearRegression />} />
            <Route path="/ml/decision-tree" element={<DecisionTree />} />
            <Route path="/ml/k-means" element={<KMeans />} />
            <Route path="/ml/neural-network" element={<NeuralNetwork />} />

            {/* LLM Visualizations */}
            <Route path="/llm/tokenization" element={<Tokenization />} />
            <Route path="/llm/attention" element={<Attention />} />
            <Route path="/llm/transformer" element={<Transformer />} />
            <Route path="/llm/prompt-explorer" element={<PromptExplorer />} />
          </Routes>
        </motion.main>
      </div>
    </Router>
  );
}

export default App;
