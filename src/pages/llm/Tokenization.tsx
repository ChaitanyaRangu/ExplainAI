import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Type, Copy, RotateCcw, Download, Shuffle } from 'lucide-react';
import VisualizationBase from '../../components/VisualizationBase';

interface TokenInfo {
  text: string;
  id: number;
  frequency: number;
  type: 'word' | 'subword' | 'punctuation' | 'special';
}

const Tokenization = () => {
  const [inputText, setInputText] = useState("Hello, world! How are you today? Machine learning is fascinating!");
  const [tokenizationMethod, setTokenizationMethod] = useState<'word' | 'subword' | 'char'>('subword');
  const [showTokenIds, setShowTokenIds] = useState(true);
  const [showFrequencies, setShowFrequencies] = useState(false);
  const [animateTokens, setAnimateTokens] = useState(true);
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [vocabulary, setVocabulary] = useState<Map<string, number>>(new Map());
  const [selectedToken, setSelectedToken] = useState<number | null>(null);
  const [downloadStatus, setDownloadStatus] = useState<string>('');

  const tokenizeWord = (text: string): TokenInfo[] => {
    const words = text.split(/(\s+|[^\w\s])/g).filter(token => token.trim() !== '');
    const tokenMap = new Map<string, number>();
    
    words.forEach(word => {
      tokenMap.set(word, (tokenMap.get(word) || 0) + 1);
    });
    
    return words.map((word, index) => ({
      text: word,
      id: index,
      frequency: tokenMap.get(word) || 1,
      type: /^\w+$/.test(word) ? 'word' : 
            /^[^\w\s]$/.test(word) ? 'punctuation' : 'special'
    }));
  };

  const tokenizeSubword = (text: string): TokenInfo[] => {
    const words = text.toLowerCase().split(/\s+/);
    const tokens: TokenInfo[] = [];
    let tokenId = 0;
    
    words.forEach(word => {
      if (word.length <= 3) {
        tokens.push({
          text: word,
          id: tokenId++,
          frequency: Math.floor(Math.random() * 10) + 1,
          type: 'word'
        });
      } else {
        for (let i = 0; i < word.length; i += 3) {
          const chunk = word.slice(i, i + 3);
          tokens.push({
            text: chunk,
            id: tokenId++,
            frequency: Math.floor(Math.random() * 5) + 1,
            type: 'subword'
          });
        }
      }
    });
    
    return tokens;
  };

  const tokenizeChar = (text: string): TokenInfo[] => {
    return Array.from(text).map((char, index) => ({
      text: char,
      id: index,
      frequency: Math.floor(Math.random() * 20) + 1,
      type: /\w/.test(char) ? 'word' : 
            /\s/.test(char) ? 'special' : 'punctuation'
    }));
  };

  const tokenize = () => {
    let newTokens: TokenInfo[] = [];
    
    switch (tokenizationMethod) {
      case 'word':
        newTokens = tokenizeWord(inputText);
        break;
      case 'subword':
        newTokens = tokenizeSubword(inputText);
        break;
      case 'char':
        newTokens = tokenizeChar(inputText);
        break;
    }
    
    setTokens(newTokens);
    
    const vocab = new Map<string, number>();
    newTokens.forEach(token => {
      vocab.set(token.text, (vocab.get(token.text) || 0) + 1);
    });
    setVocabulary(vocab);
  };

  const getTokenColor = (token: TokenInfo): string => {
    switch (token.type) {
      case 'word': return '#667eea';
      case 'subword': return '#4ecdc4';
      case 'punctuation': return '#ff6b6b';
      case 'special': return '#feca57';
      default: return '#95a5a6';
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const exportTokens = () => {
    setDownloadStatus('Preparing download...');

    const data = {
      input: inputText,
      method: tokenizationMethod,
      tokens: tokens,
      vocabulary: Array.from(vocabulary.entries()),
      timestamp: new Date().toISOString(),
      stats: {
        totalTokens: tokens.length,
        uniqueTokens: vocabulary.size,
        avgTokenLength: tokens.length > 0 ? (tokens.reduce((sum, t) => sum + t.text.length, 0) / tokens.length).toFixed(2) : '0'
      }
    };

    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tokenization_${tokenizationMethod}_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setDownloadStatus('Download completed!');
      setTimeout(() => setDownloadStatus(''), 3000);
    } catch (error) {
      setDownloadStatus('Download failed!');
      setTimeout(() => setDownloadStatus(''), 3000);
    }
  };

  const reset = () => {
    setInputText("Hello, world! How are you today? Machine learning is fascinating!");
    setTokenizationMethod('subword');
    setSelectedToken(null);
  };

  const generateRandomText = () => {
    const samples = [
      "The quick brown fox jumps over the lazy dog.",
      "Artificial intelligence is transforming our world rapidly.",
      "Natural language processing enables machines to understand human language.",
      "Deep learning models require large amounts of training data.",
      "Transformers have revolutionized the field of machine learning.",
      "Tokenization is a crucial preprocessing step in NLP pipelines."
    ];
    setInputText(samples[Math.floor(Math.random() * samples.length)]);
  };

  useEffect(() => {
    tokenize();
  }, [inputText, tokenizationMethod]);

  const controls = (
    <>
      <div className="controls-grid">
        <div className="control-group">
          <label>Input Text</label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="text-input"
            rows={3}
            placeholder="Enter text to tokenize..."
          />
        </div>
        
        <div className="control-group">
          <label>Tokenization Method</label>
          <select 
            value={tokenizationMethod} 
            onChange={(e) => setTokenizationMethod(e.target.value as any)}
            className="select-input"
          >
            <option value="word">Word-level</option>
            <option value="subword">Subword (BPE-like)</option>
            <option value="char">Character-level</option>
          </select>
        </div>
        
        <div className="control-group">
          <label>Display Options</label>
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={showTokenIds}
                onChange={(e) => setShowTokenIds(e.target.checked)}
              />
              Show Token IDs
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={showFrequencies}
                onChange={(e) => setShowFrequencies(e.target.checked)}
              />
              Show Frequencies
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={animateTokens}
                onChange={(e) => setAnimateTokens(e.target.checked)}
              />
              Animate Tokens
            </label>
          </div>
        </div>
      </div>

      <div className="button-group">
        <button className="btn btn-primary" onClick={tokenize}>
          <Type size={16} />
          Tokenize
        </button>
        
        <button 
          className="btn btn-secondary" 
          onClick={() => copyToClipboard(tokens.map(t => t.text).join(' | '))}
        >
          <Copy size={16} />
          Copy Tokens
        </button>
        
        <button className="btn btn-secondary" onClick={exportTokens} disabled={tokens.length === 0}>
          <Download size={16} />
          {downloadStatus || 'Export JSON'}
        </button>
        
        <button className="btn btn-secondary" onClick={generateRandomText}>
          <Shuffle size={16} />
          Random Text
        </button>
        
        <button className="btn btn-secondary" onClick={reset}>
          <RotateCcw size={16} />
          Reset
        </button>
      </div>
    </>
  );

  const stats = [
    { label: 'Total Tokens', value: tokens.length, icon: <Type size={16} /> },
    { label: 'Unique Tokens', value: vocabulary.size, icon: <Type size={16} /> },
    { label: 'Method', value: tokenizationMethod, icon: <Type size={16} /> },
    { label: 'Avg Token Length', value: tokens.length > 0 ? (tokens.reduce((sum, t) => sum + t.text.length, 0) / tokens.length).toFixed(1) : '0', icon: <Type size={16} /> }
  ];

  return (
    <VisualizationBase
      title="Tokenization Visualizer"
      description="Explore different tokenization methods and see how text is broken down into tokens"
      controls={controls}
      stats={stats}
      onVisualizationReady={() => {}}
      width={800}
      height={600}
    >
      <div className="tokenization-content">
        <div className="tokens-display">
          <h3>Tokens ({tokens.length})</h3>
          <div className="tokens-grid">
            {tokens.map((token, index) => (
              <motion.div
                key={`${token.id}-${index}`}
                className={`token ${selectedToken === index ? 'selected' : ''}`}
                style={{ backgroundColor: getTokenColor(token) }}
                initial={animateTokens ? { opacity: 0, scale: 0.8 } : {}}
                animate={animateTokens ? { opacity: 1, scale: 1 } : {}}
                transition={animateTokens ? { delay: index * 0.05, duration: 0.3 } : {}}
                onClick={() => setSelectedToken(selectedToken === index ? null : index)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="token-text">{token.text}</div>
                {showTokenIds && <div className="token-id">ID: {token.id}</div>}
                {showFrequencies && <div className="token-freq">Freq: {token.frequency}</div>}
                <div className="token-type">{token.type}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .tokenization-content {
          padding: 1rem;
          max-width: 100%;
        }

        .text-input {
          width: 100%;
          min-height: 80px;
          resize: vertical;
          padding: 0.75rem;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          font-size: 0.9rem;
          font-family: 'Courier New', monospace;
        }

        .select-input {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          font-size: 0.9rem;
          background: white;
        }

        .checkbox-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          cursor: pointer;
        }

        .tokens-display {
          margin-bottom: 2rem;
        }

        .tokens-display h3 {
          margin-bottom: 1rem;
          color: #333;
        }

        .tokens-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .token {
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
          color: white;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 60px;
          text-align: center;
          border: 2px solid transparent;
        }

        .token.selected {
          border-color: #ffd700;
          box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
        }

        .token-text {
          font-size: 0.9rem;
          margin-bottom: 0.25rem;
        }

        .token-id, .token-freq {
          font-size: 0.7rem;
          opacity: 0.8;
        }

        .token-type {
          font-size: 0.6rem;
          opacity: 0.7;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        @media (max-width: 768px) {
          .tokens-grid {
            justify-content: center;
          }
        }
      `}</style>
    </VisualizationBase>
  );
};

export default Tokenization;
