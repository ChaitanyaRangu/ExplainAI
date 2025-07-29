import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Type, Copy, RotateCcw, Download, Upload, Shuffle } from 'lucide-react';
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

  // Enhanced tokenization methods with type information
  const tokenizeText = (text: string, method: string): TokenInfo[] => {
    let rawTokens: string[] = [];

    switch (method) {
      case 'word':
        rawTokens = text.split(/(\s+|[^\w\s])/).filter(token => token.trim().length > 0);
        break;
      case 'char':
        rawTokens = text.split('');
        break;
      case 'subword':
        // Enhanced BPE-like tokenization
        const words = text.split(/(\s+|[^\w\s])/);
        rawTokens = [];
        words.forEach(word => {
          if (/^\s+$/.test(word)) {
            // Skip whitespace
            return;
          } else if (/^[^\w\s]$/.test(word)) {
            // Punctuation
            rawTokens.push(word);
          } else if (word.length <= 4) {
            rawTokens.push(word.toLowerCase());
          } else {
            // Split longer words into subwords with common prefixes/suffixes
            const commonPrefixes = ['un', 're', 'pre', 'dis', 'over', 'under'];
            const commonSuffixes = ['ing', 'ed', 'er', 'est', 'ly', 'tion', 'ness'];

            let remaining = word.toLowerCase();

            // Check for prefixes
            for (const prefix of commonPrefixes) {
              if (remaining.startsWith(prefix) && remaining.length > prefix.length + 2) {
                rawTokens.push(prefix);
                remaining = remaining.slice(prefix.length);
                break;
              }
            }

            // Check for suffixes
            for (const suffix of commonSuffixes) {
              if (remaining.endsWith(suffix) && remaining.length > suffix.length + 2) {
                const root = remaining.slice(0, -suffix.length);
                if (root.length >= 2) {
                  rawTokens.push(root);
                  rawTokens.push(suffix);
                  remaining = '';
                  break;
                }
              }
            }

            // If no prefix/suffix found, split into chunks
            if (remaining.length > 0) {
              for (let i = 0; i < remaining.length; i += 3) {
                const chunk = remaining.slice(i, i + 3);
                if (chunk.length > 0) {
                  rawTokens.push(chunk);
                }
              }
            }
          }
        });
        break;
      default:
        rawTokens = [];
    }

    // Count frequencies and assign types
    const tokenCounts = new Map<string, number>();
    rawTokens.forEach(token => {
      tokenCounts.set(token, (tokenCounts.get(token) || 0) + 1);
    });

    // Create TokenInfo objects
    const tokenInfos: TokenInfo[] = [];
    const uniqueTokens = Array.from(tokenCounts.keys());

    rawTokens.forEach((token, index) => {
      const frequency = tokenCounts.get(token) || 1;
      let type: TokenInfo['type'] = 'word';

      if (/^[^\w\s]$/.test(token)) {
        type = 'punctuation';
      } else if (token.length === 1 && method === 'char') {
        type = /\w/.test(token) ? 'word' : 'punctuation';
      } else if (['ing', 'ed', 'er', 'est', 'ly', 'tion', 'ness', 'un', 're', 'pre', 'dis'].includes(token)) {
        type = 'subword';
      }

      tokenInfos.push({
        text: token,
        id: uniqueTokens.indexOf(token),
        frequency,
        type
      });
    });

    return tokenInfos;
  };

  const tokens = tokenizeText(inputText, tokenizationMethod);

  // Create vocabulary mapping
  const vocabulary = Array.from(new Set(tokens.map(t => t.text)));
  const tokenToId = Object.fromEntries(vocabulary.map((token, index) => [token, index]));

  // Get token type colors
  const getTokenColor = (type: TokenInfo['type']) => {
    switch (type) {
      case 'word': return '#667eea';
      case 'subword': return '#4ecdc4';
      case 'punctuation': return '#ff6b6b';
      case 'special': return '#feca57';
      default: return '#999';
    }
  };

  const resetText = () => {
    setInputText("Hello, world! How are you today? Machine learning is fascinating!");
  };

  const copyTokens = () => {
    const tokenData = {
      tokens: tokens.map(t => t.text),
      vocabulary: vocabulary,
      tokenIds: tokens.map(t => tokenToId[t.text]),
      method: tokenizationMethod
    };
    navigator.clipboard.writeText(JSON.stringify(tokenData, null, 2));
  };

  const downloadTokens = () => {
    const tokenData = {
      originalText: inputText,
      method: tokenizationMethod,
      tokens: tokens,
      vocabulary: vocabulary,
      statistics: {
        totalTokens: tokens.length,
        uniqueTokens: vocabulary.length,
        compressionRatio: inputText.length / tokens.length
      }
    };

    const blob = new Blob([JSON.stringify(tokenData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tokenization_result.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const shuffleText = () => {
    const examples = [
      "The quick brown fox jumps over the lazy dog.",
      "Machine learning is transforming artificial intelligence rapidly.",
      "Natural language processing enables computers to understand human language.",
      "Tokenization is the first step in text preprocessing pipelines.",
      "Deep learning models require large amounts of training data.",
      "Transformers revolutionized the field of natural language processing.",
      "Attention mechanisms help models focus on relevant information.",
      "Pre-trained language models can be fine-tuned for specific tasks."
    ];
    const randomExample = examples[Math.floor(Math.random() * examples.length)];
    setInputText(randomExample);
  };

  const controls = (
    <>
      <div className="controls-grid">
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
        <button className="btn btn-secondary" onClick={resetText}>
          <RotateCcw size={16} />
          Reset
        </button>

        <button className="btn btn-secondary" onClick={shuffleText}>
          <Shuffle size={16} />
          Random Example
        </button>

        <button className="btn btn-primary" onClick={copyTokens}>
          <Copy size={16} />
          Copy Data
        </button>

        <button className="btn btn-primary" onClick={downloadTokens}>
          <Download size={16} />
          Download JSON
        </button>
      </div>
    </>
  );

  const stats = [
    { label: 'Total Tokens', value: tokens.length, icon: <Type size={16} /> },
    { label: 'Unique Tokens', value: vocabulary.length, icon: <Type size={16} /> },
    { label: 'Characters', value: inputText.length, icon: <Type size={16} /> },
    { label: 'Compression Ratio', value: (inputText.length / tokens.length).toFixed(2), icon: <Type size={16} /> }
  ];

  return (
    <VisualizationBase
      title="Tokenization Visualizer"
      description="See how text is broken down into tokens for language models"
      controls={controls}
      stats={stats}
      width={800}
      height={600}
    >
      <div className="tokenization-content">
        <div className="input-section">
          <h3>Input Text</h3>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter your text here..."
            className="text-input"
            rows={4}
          />
        </div>

        <motion.div
          className="tokens-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h3>Tokens ({tokens.length})</h3>
          <div className="tokens-container">
            {tokens.map((token, index) => (
              <motion.div
                key={`${token.text}-${index}`}
                className={`token token-${token.type}`}
                initial={animateTokens ? { opacity: 0, scale: 0.8 } : {}}
                animate={animateTokens ? { opacity: 1, scale: 1 } : {}}
                transition={animateTokens ? { delay: index * 0.02, duration: 0.3 } : {}}
                whileHover={{ scale: 1.05 }}
                style={{ backgroundColor: getTokenColor(token.type) }}
                title={`Type: ${token.type}, Frequency: ${token.frequency}`}
              >
                <span className="token-text">{token.text}</span>
                {showTokenIds && (
                  <span className="token-id">{tokenToId[token.text]}</span>
                )}
                {showFrequencies && (
                  <span className="token-frequency">×{token.frequency}</span>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="legend-section">
          <h3>Token Types</h3>
          <div className="legend-container">
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: getTokenColor('word') }}></div>
              <span>Word</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: getTokenColor('subword') }}></div>
              <span>Subword</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: getTokenColor('punctuation') }}></div>
              <span>Punctuation</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: getTokenColor('special') }}></div>
              <span>Special</span>
            </div>
          </div>
        </div>

        <div className="vocabulary-section">
          <h3>Vocabulary ({vocabulary.length} unique tokens)</h3>
          <div className="vocabulary-container">
            {vocabulary.map((token, index) => (
              <div key={index} className="vocab-item">
                <span className="vocab-token">{token}</span>
                <span className="vocab-id">{index}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .tokenization-content {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          width: 100%;
        }

        .input-section h3,
        .tokens-section h3,
        .legend-section h3,
        .vocabulary-section h3 {
          margin-bottom: 1rem;
          color: #333;
          font-size: 1.3rem;
        }

        .text-input {
          width: 100%;
          min-height: 100px;
          resize: vertical;
          padding: 1rem;
          border: 2px solid #e9ecef;
          border-radius: 8px;
          font-family: 'Courier New', monospace;
          font-size: 0.9rem;
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

        .tokens-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 12px;
          min-height: 100px;
          max-height: 300px;
          overflow-y: auto;
        }

        .token {
          display: flex;
          flex-direction: column;
          align-items: center;
          color: white;
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          position: relative;
        }

        .token:hover {
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .token-text {
          font-weight: 600;
          margin-bottom: 0.25rem;
          font-family: 'Courier New', monospace;
        }

        .token-id, .token-frequency {
          font-size: 0.7rem;
          opacity: 0.9;
          background: rgba(255, 255, 255, 0.2);
          padding: 0.1rem 0.3rem;
          border-radius: 4px;
          margin-top: 0.1rem;
        }

        .legend-section {
          margin: 1rem 0;
        }

        .legend-container {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem;
          background: #f8f9fa;
          border-radius: 6px;
          border: 1px solid #e9ecef;
        }

        .legend-color {
          width: 16px;
          height: 16px;
          border-radius: 4px;
          border: 1px solid #ccc;
        }

        .vocabulary-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 0.5rem;
          max-height: 300px;
          overflow-y: auto;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 12px;
        }

        .vocab-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          background: white;
          border-radius: 6px;
          font-size: 0.8rem;
          border: 1px solid #e9ecef;
        }

        .vocab-token {
          font-weight: 600;
          color: #333;
          font-family: 'Courier New', monospace;
        }

        .vocab-id {
          color: #667eea;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .tokens-container {
            padding: 0.5rem;
          }

          .token {
            padding: 0.4rem 0.6rem;
            font-size: 0.8rem;
          }

          .legend-container {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      `}</style>
    </VisualizationBase>
  );
};

export default Tokenization;
