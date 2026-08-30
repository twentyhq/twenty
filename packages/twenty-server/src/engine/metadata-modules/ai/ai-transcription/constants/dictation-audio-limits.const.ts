// A dictation turn is a sentence or two. The caps exist because an endpoint
// that forwards arbitrary audio to a paid provider is a cheap way to burn a
// workspace's credits.
export const MAX_DICTATION_DURATION_SECONDS = 120;

// Comfortably above two minutes of any container a browser records (AAC at
// 128kbps is ~1.9MB). The reader enforces it mid-stream, so it also bounds
// what a single request can buffer in memory.
export const MAX_DICTATION_AUDIO_BYTES = 4 * 1024 * 1024;
