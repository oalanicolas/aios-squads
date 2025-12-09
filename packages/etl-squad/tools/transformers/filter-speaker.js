// TODO: EXPAND - Extract only target speaker utterances

export function filterSpeaker(utterances, targetSpeaker) {
  return utterances.filter(u => u.speaker === targetSpeaker);
}

export function identifyTargetSpeaker(utterances) {
  // TODO: Implement full heuristics from speaker-filter.js
  const stats = {};

  utterances.forEach(u => {
    if (!stats[u.speaker]) {
      stats[u.speaker] = { duration: 0, count: 0 };
    }
    stats[u.speaker].duration += (u.end - u.start);
    stats[u.speaker].count++;
  });

  return Object.entries(stats).reduce((max, [speaker, data]) =>
    data.duration > (stats[max]?.duration || 0) ? speaker : max,
    Object.keys(stats)[0]
  );
}
