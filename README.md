# 🧠 ExplainAI - Interactive ML/LLM Visualization Platform

[![Deploy to GitHub Pages](https://github.com/YOUR_USERNAME/ExplainAI/actions/workflows/deploy.yml/badge.svg)](https://github.com/YOUR_USERNAME/ExplainAI/actions/workflows/deploy.yml)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-blue)](https://YOUR_USERNAME.github.io/ExplainAI/)

An interactive educational platform that makes Machine Learning and Large Language Model concepts accessible through beautiful, hands-on visualizations. Built with React, TypeScript, and D3.js.

## 🌟 Features

### Traditional ML Visualizations
- **Linear Regression** - Interactive gradient descent with real-time cost visualization
- **K-Means Clustering** - Animated centroid movement with convergence detection
- **Neural Network Playground** - Interactive architecture with live forward propagation
- **Decision Tree Visualizer** - Interactive tree building with animated growth

### LLM Visualizations
- **Tokenization Visualizer** - Enhanced BPE-like tokenization with interactive controls
- **Attention Mechanism** - Interactive attention heatmaps with multi-head support
- **Transformer Architecture** - Step-by-step data flow through transformer layers
- **Prompt Engineering Explorer** - 6 different prompting techniques with A/B testing

## 🚀 Live Demo

Visit the live application: [https://YOUR_USERNAME.github.io/ExplainAI/](https://YOUR_USERNAME.github.io/ExplainAI/)

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript
- **Visualizations**: D3.js, Framer Motion
- **Styling**: CSS3 with Glassmorphism effects
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Deployment**: GitHub Pages

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/ExplainAI.git
cd ExplainAI
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:5174](http://localhost:5174) in your browser.

## 🚀 Deployment

### Automatic Deployment (Recommended)
The project is configured with GitHub Actions for automatic deployment to GitHub Pages:

1. Push your changes to the `main` branch
2. GitHub Actions will automatically build and deploy your site
3. Your site will be available at `https://YOUR_USERNAME.github.io/ExplainAI/`

### Manual Deployment
```bash
npm run build
npm run deploy
```

## 📁 Project Structure

```
ExplainAI/
├── src/
│   ├── components/          # Reusable components
│   │   └── VisualizationBase.tsx
│   ├── pages/
│   │   ├── ml/             # Traditional ML visualizations
│   │   │   ├── LinearRegression.tsx
│   │   │   ├── KMeans.tsx
│   │   │   ├── NeuralNetwork.tsx
│   │   │   └── DecisionTree.tsx
│   │   └── llm/            # LLM visualizations
│   │       ├── Tokenization.tsx
│   │       ├── Attention.tsx
│   │       ├── Transformer.tsx
│   │       └── PromptExplorer.tsx
│   ├── utils/              # Utility functions
│   │   └── d3-helpers.ts
│   ├── App.tsx
│   └── main.tsx
├── public/                 # Static assets
├── .github/workflows/      # GitHub Actions
└── dist/                   # Build output
```

## 🎯 Educational Goals

This platform aims to:
- Make complex AI concepts accessible through interactive visualization
- Provide hands-on learning experiences with immediate feedback
- Bridge the gap between theory and practical understanding
- Offer professional-quality educational tools for free

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Inspired by [Visualgo](https://visualgo.net/) for algorithm visualization
- Built with modern web technologies for optimal performance
- Designed with accessibility and education in mind

---

⭐ Star this repository if you found it helpful!
