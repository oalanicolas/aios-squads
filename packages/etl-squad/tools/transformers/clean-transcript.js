// TODO: EXPAND - Clean transcript noise and formatting

export function cleanTranscript(text) {
  return text
    .replace(/\[MUSIC\]/gi, '')
    .replace(/\[APPLAUSE\]/gi, '')
    .replace(/\[LAUGHTER\]/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}
