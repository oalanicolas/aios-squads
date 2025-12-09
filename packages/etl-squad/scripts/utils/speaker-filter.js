/**
 * Speaker Filter
 * Filters transcript utterances to focus on target speaker (interviewee)
 * Uses AssemblyAI diarization data to identify and extract relevant content
 */

/**
 * Calculate speaker statistics from transcript utterances
 * @param {Array} utterances - Array of utterance objects from AssemblyAI
 * @returns {object} Speaker statistics
 */
export function calculateSpeakerStats(_utterances) {
  const stats = {};

  utterances.forEach(utterance => {
    const speaker = utterance.speaker;

    if (!stats[speaker]) {
      stats[speaker] = {
        speaker,
        utteranceCount: 0,
        totalDuration: 0,
        totalWords: 0,
        avgUtteranceDuration: 0,
        avgUtteranceWords: 0,
        firstAppearance: utterance.start,
        lastAppearance: utterance.end
      };
    }

    const duration = utterance.end - utterance.start;
    const wordCount = utterance.text.split(/\s+/).length;

    stats[speaker].utteranceCount++;
    stats[speaker].totalDuration += duration;
    stats[speaker].totalWords += wordCount;
    stats[speaker].lastAppearance = utterance.end;
  });

  // Calculate averages
  Object.values(stats).forEach(speaker => {
    speaker.avgUtteranceDuration = speaker.totalDuration / speaker.utteranceCount;
    speaker.avgUtteranceWords = speaker.totalWords / speaker.utteranceCount;
  });

  return stats;
}

/**
 * Identify target speaker using heuristics
 * @param {Array} utterances - Transcript utterances
 * @param {object} options - Detection options
 * @returns {string} Target speaker ID
 */
export function identifyTargetSpeaker(_utterances, options = {}) {
  const {
    rules = {
      most_speech_time: 0.4,
      longest_utterances: 0.3,
      second_speaker: 0.2,
      response_pattern: 0.1
    },
    expectedSpeakers = 2
  } = options;

  const stats = calculateSpeakerStats(utterances);
  const speakers = Object.keys(stats);

  if (speakers.length === 0) {
    throw new Error('No speakers found in transcript');
  }

  if (speakers.length === 1) {
    return speakers[0];  // Only one speaker
  }

  // Calculate scores for each speaker
  const scores = {};

  speakers.forEach(speaker => {
    scores[speaker] = 0;

    // Rule 1: Most speech time
    const totalSpeechTime = Object.values(stats).reduce((sum, s) => sum + s.totalDuration, 0);
    const speechTimeRatio = stats[speaker].totalDuration / totalSpeechTime;
    scores[speaker] += speechTimeRatio * rules.most_speech_time * 100;

    // Rule 2: Longest utterances
    const maxAvgDuration = Math.max(...Object.values(stats).map(s => s.avgUtteranceDuration));
    const durationRatio = stats[speaker].avgUtteranceDuration / maxAvgDuration;
    scores[speaker] += durationRatio * rules.longest_utterances * 100;

    // Rule 3: Second speaker (interviewer usually speaks first)
    if (stats[speaker].firstAppearance > 0) {  // Not the first speaker
      scores[speaker] += rules.second_speaker * 100;
    }

    // Rule 4: Response pattern (longer responses indicate interviewee)
    const maxWords = Math.max(...Object.values(stats).map(s => s.avgUtteranceWords));
    const wordsRatio = stats[speaker].avgUtteranceWords / maxWords;
    scores[speaker] += wordsRatio * rules.response_pattern * 100;
  });

  // Find speaker with highest score
  const targetSpeaker = Object.entries(scores).reduce((max, [speaker, score]) =>
    score > max.score ? { speaker, score } : max,
    { speaker: speakers[0], score: 0 }
  );

  return targetSpeaker.speaker;
}

/**
 * Filter utterances by target speaker
 * @param {Array} utterances - All utterances
 * @param {string} targetSpeaker - Target speaker ID
 * @returns {Array} Filtered utterances
 */
export function filterByTargetSpeaker(_utterances, targetSpeaker) {
  return utterances.filter(u => u.speaker === targetSpeaker);
}

/**
 * Format transcript utterances as markdown
 * @param {Array} utterances - Utterances to format
 * @param {object} options - Formatting options
 * @returns {string} Markdown transcript
 */
export function formatTranscriptMarkdown(_utterances, options = {}) {
  const {
    showSpeakers = true,
    showTimestamps = true,
    highlightTarget = null,
    groupByTopic = false
  } = options;

  let markdown = '';

  utterances.forEach((utterance, index) => {
    const speaker = utterance.speaker;
    const _text = utterance.text.trim();
    const timestamp = formatTimestamp(utterance.start);

    // Add line break between utterances
    if (index > 0) {
      markdown += '\n\n';
    }

    // Format: **[00:05:23 - Speaker B]**
    let prefix = '**[';

    if (showTimestamps) {
      prefix += timestamp;
    }

    if (showSpeakers) {
      if (showTimestamps) prefix += ' - ';
      prefix += speaker;

      // Highlight target speaker
      if (highlightTarget && speaker === highlightTarget) {
        prefix += ' ⭐';
      }
    }

    prefix += ']**\n';

    markdown += prefix + text;
  });

  return markdown;
}

/**
 * Format seconds to HH:MM:SS or MM:SS
 */
function formatTimestamp(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  } else {
    return `${pad(minutes)}:${pad(seconds)}`;
  }
}

function pad(num) {
  return String(num).padStart(2, '0');
}

/**
 * Create complete transcript markdown with metadata
 * @param {object} transcriptData - Complete transcript data from AssemblyAI
 * @param {object} sourceMetadata - Source metadata (title, url, etc)
 * @returns {string} Complete markdown document
 */
export function createTranscriptDocument(transcriptData, sourceMetadata = {}) {
  const {
    utterances = [],
    words = [],
    text = '',
    audio_duration = 0,
    confidence = 0
  } = transcriptData;

  // Identify target speaker
  const targetSpeaker = identifyTargetSpeaker(utterances);
  const stats = calculateSpeakerStats(utterances);

  // Filter for target speaker
  const targetUtterances = filterByTargetSpeaker(utterances, targetSpeaker);

  // Build markdown
  let markdown = '';

  // Add title
  if (sourceMetadata.title) {
    markdown += `# ${sourceMetadata.title}\n\n`;
  }

  // Add metadata section
  markdown += '## Interview Details\n\n';

  if (sourceMetadata.source_type) {
    markdown += `**Source:** ${sourceMetadata.source_type}\n`;
  }

  if (sourceMetadata.url) {
    markdown += `**URL:** ${sourceMetadata.url}\n`;
  }

  const totalDuration = formatTimestamp(audio_duration * 1000);
  markdown += `**Duration:** ${totalDuration}\n`;
  markdown += `**Confidence:** ${(confidence * 100).toFixed(1)}%\n`;
  markdown += `**Speakers:** ${Object.keys(stats).length}\n`;
  markdown += `**Target Speaker:** ${targetSpeaker}\n\n`;

  // Speaker statistics
  markdown += '## Speaker Statistics\n\n';

  Object.entries(stats).forEach(([speaker, data]) => {
    const isTarget = speaker === targetSpeaker;
    const duration = formatTimestamp(data.totalDuration * 1000);
    const percentage = ((data.totalDuration / audio_duration) * 100).toFixed(1);

    markdown += `**${speaker}${isTarget ? ' (Target ⭐)' : ''}**\n`;
    markdown += `- Speaking time: ${duration} (${percentage}%)\n`;
    markdown += `- Utterances: ${data.utteranceCount}\n`;
    markdown += `- Words: ${data.totalWords}\n`;
    markdown += `- Avg utterance: ${data.avgUtteranceWords.toFixed(1)} words, ${data.avgUtteranceDuration.toFixed(1)}s\n\n`;
  });

  markdown += '---\n\n';

  // Target speaker transcript
  markdown += `## Transcript (Target Speaker: ${targetSpeaker})\n\n`;
  markdown += formatTranscriptMarkdown(targetUtterances, {
    showSpeakers: true,
    showTimestamps: true,
    highlightTarget: targetSpeaker
  });

  markdown += '\n\n---\n\n';

  // Full transcript
  markdown += '## Full Transcript (All Speakers)\n\n';
  markdown += formatTranscriptMarkdown(utterances, {
    showSpeakers: true,
    showTimestamps: true,
    highlightTarget: targetSpeaker
  });

  return markdown;
}

/**
 * Extract topics/themes from utterances
 * (Placeholder for future enhancement with NLP)
 */
export function extractTopics(_utterances) {
  // TODO: Implement topic extraction using NLP
  // For now, return empty array
  return [];
}

/**
 * Validate transcript quality
 */
export function validateTranscriptQuality(transcriptData) {
  const {
    utterances = [],
    confidence = 0,
    audio_duration = 0
  } = transcriptData;

  const issues = [];
  let score = 100;

  // Check confidence
  if (confidence < 0.85) {
    issues.push(`Low confidence: ${(confidence * 100).toFixed(1)}%`);
    score -= 20;
  }

  // Check speaker diarization
  const stats = calculateSpeakerStats(utterances);
  const speakerCount = Object.keys(stats).length;

  if (speakerCount === 0) {
    issues.push('No speakers detected');
    score -= 50;
  } else if (speakerCount === 1) {
    issues.push('Only one speaker detected (expected interview with 2+ speakers)');
    score -= 10;
  }

  // Check transcript length
  const totalWords = Object.values(stats).reduce((sum, s) => sum + s.totalWords, 0);

  if (totalWords < 100) {
    issues.push('Very short transcript (< 100 words)');
    score -= 30;
  }

  // Check duration match
  const expectedWords = (audio_duration / 60) * 150;  // ~150 words per minute
  const wordRatio = totalWords / expectedWords;

  if (wordRatio < 0.5) {
    issues.push('Transcript seems incomplete (much shorter than expected)');
    score -= 20;
  }

  return {
    score: Math.max(0, score),
    acceptable: score >= 70,
    confidence: confidence * 100,
    speakerCount,
    totalWords,
    issues
  };
}
