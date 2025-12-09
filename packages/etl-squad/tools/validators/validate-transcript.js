// TODO: EXPAND - Validate transcript diarization quality

export function validateTranscript(transcript) {
  const { utterances = [], confidence = 0 } = transcript;

  const issues = [];
  let score = 100;

  if (confidence < 0.85) {
    issues.push('Low confidence');
    score -= 20;
  }

  const speakerCount = new Set(utterances.map(u => u.speaker)).size;
  if (speakerCount < 2) {
    issues.push('Less than 2 speakers detected');
    score -= 30;
  }

  return {
    score,
    acceptable: score >= 70,
    confidence: confidence * 100,
    speakerCount,
    issues
  };
}
