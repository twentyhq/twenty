// A dictation turn is a sentence or two. The caps exist because an endpoint
// that forwards arbitrary audio to a paid provider is a cheap way to burn a
// workspace's credits, so both are enforced before the provider is called.
export const MAX_DICTATION_DURATION_SECONDS = 120;

// Comfortably above two minutes of any container a browser records (AAC at
// 128kbps is ~1.9MB) while keeping the base64 body under the 10MB JSON limit
// configured in main.ts.
export const MAX_DICTATION_AUDIO_BYTES = 4 * 1024 * 1024;
