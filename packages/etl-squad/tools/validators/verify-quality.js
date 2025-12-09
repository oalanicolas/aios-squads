// TODO: EXPAND - Validate content quality (transcripts, articles, etc)

export function verifyQuality(content, _type) {
  const checks = {
    hasContent: content.length > 100,
    noErrors: !content.includes('[ERROR]'),
    properFormat: true
  };

  const score = Object.values(checks).filter(Boolean).length / Object.keys(checks).length * 100;

  return {
    score,
    acceptable: score >= 70,
    checks
  };
}
