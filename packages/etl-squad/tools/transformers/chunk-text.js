// TODO: EXPAND - Semantic text chunking for analysis

export function chunkText(text, options = {}) {
  const { maxTokens = 500, overlap = 50 } = options;

  // Simple word-based chunking (TODO: implement semantic chunking)
  const words = text.split(/\s+/);
  const chunks = [];

  for (let i = 0; i < words.length; i += maxTokens - overlap) {
    const chunk = words.slice(i, i + maxTokens).join(' ');
    chunks.push({
      text: chunk,
      start: i,
      end: Math.min(i + maxTokens, words.length)
    });
  }

  return chunks;
}
