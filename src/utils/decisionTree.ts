// Simple CART decision tree builder with step-by-step generation
// - Supports numeric features only
// - Uses Gini impurity for splits

export type Sample = { features: number[]; label: string };

export type TreeNode = {
  id: number;
  samples: Sample[];
  depth: number;
  prediction?: string; // majority label at node
  featureIndex?: number;
  threshold?: number;
  left?: TreeNode | null;
  right?: TreeNode | null;
  impurity?: number;
  infoGain?: number;
};

let NODE_ID = 1;

export function resetIds() {
  NODE_ID = 1;
}

function gini(samples: Sample[]) {
  const counts: Record<string, number> = {};
  samples.forEach(s => (counts[s.label] = (counts[s.label] || 0) + 1));
  const n = samples.length;
  let score = 1;
  for (const k in counts) {
    const p = counts[k] / n;
    score -= p * p;
  }
  return score;
}

function majorityLabel(samples: Sample[]) {
  const counts: Record<string, number> = {};
  samples.forEach(s => (counts[s.label] = (counts[s.label] || 0) + 1));
  let best = ''; let bestCount = -1;
  for (const k in counts) {
    if (counts[k] > bestCount) { bestCount = counts[k]; best = k; }
  }
  return best;
}

// find best split across all features (numeric)
export function findBestSplit(samples: Sample[]) {
  const nFeatures = samples[0]?.features.length ?? 0;
  const baseImpurity = gini(samples);
  const n = samples.length;
  let best = { featureIndex: -1, threshold: 0, infoGain: 0, impurityLeft: 0, impurityRight: 0 };

  for (let fi = 0; fi < nFeatures; fi++) {
    // gather sorted unique thresholds
    const values = samples.map(s => s.features[fi]).sort((a, b) => a - b);
    const thresholds = [] as number[];
    for (let i = 1; i < values.length; i++) {
      const t = (values[i - 1] + values[i]) / 2;
      thresholds.push(t);
    }
    // evaluate thresholds
    thresholds.forEach(th => {
      const left = samples.filter(s => s.features[fi] <= th);
      const right = samples.filter(s => s.features[fi] > th);
      if (left.length === 0 || right.length === 0) return;
      const impL = gini(left);
      const impR = gini(right);
      const weighted = (left.length / n) * impL + (right.length / n) * impR;
      const infoGain = baseImpurity - weighted;
      if (infoGain > best.infoGain) {
        best = { featureIndex: fi, threshold: th, infoGain, impurityLeft: impL, impurityRight: impR };
      }
    });
  }

  return best.featureIndex === -1 ? null : best;
}

// Build tree recursively, but expose step generator for interactive building
export function* buildTreeStepwise(samples: Sample[], maxDepth = 3, minSamplesSplit = 2) {
  resetIds();
  function createNode(samplesLocal: Sample[], depth: number): TreeNode {
    const node: TreeNode = {
      id: NODE_ID++,
      samples: samplesLocal,
      depth,
      prediction: majorityLabel(samplesLocal),
      impurity: gini(samplesLocal),
    };
    return node;
  }

  const root = createNode(samples, 0);
  // queue for BFS style building, but we'll yield after each split
  const queue: TreeNode[] = [root];

  while (queue.length > 0) {
    const node = queue.shift()!;
    // stopping criteria
    if (node.depth >= maxDepth || node.samples.length < minSamplesSplit || node.impurity === 0) {
      // leaf
      node.left = null;
      node.right = null;
      yield { type: 'node_created', node } as any;
      continue;
    }

    // Find best split
    const best = findBestSplit(node.samples);
    if (!best || best.infoGain <= 0) {
      node.left = null;
      node.right = null;
      yield { type: 'node_created', node } as any;
      continue;
    }

    node.featureIndex = best.featureIndex;
    node.threshold = best.threshold;
    node.infoGain = best.infoGain;

    // create children
    const leftSamples = node.samples.filter(s => s.features[node.featureIndex!] <= node.threshold!);
    const rightSamples = node.samples.filter(s => s.features[node.featureIndex!] > node.threshold!);

    const leftNode = createNode(leftSamples, node.depth + 1);
    const rightNode = createNode(rightSamples, node.depth + 1);

    node.left = leftNode;
    node.right = rightNode;

    // yield a split event before pushing children so visualization can highlight
    yield { type: 'split', node, leftNode, rightNode, split: { featureIndex: node.featureIndex, threshold: node.threshold, infoGain: node.infoGain } } as any;

    // after split created, push children to queue to continue building
    queue.push(leftNode);
    queue.push(rightNode);
  }

  // final complete tree event
  yield { type: 'done', root } as any;
}

// classify a point by walking tree
export function classify(root: TreeNode | null, point: number[]) {
  let node = root;
  while (node && node.left && node.right && node.featureIndex !== undefined && node.threshold !== undefined) {
    if (point[node.featureIndex] <= node.threshold) node = node.left as TreeNode;
    else node = node.right as TreeNode;
  }
  return node?.prediction ?? null;
}
