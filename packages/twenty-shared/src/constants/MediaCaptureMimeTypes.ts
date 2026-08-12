// Mime types accepted for media captured in the app (microphone / camera
// recordings). The server matches these against the content-sniffed mime
// type, so container-level and codec-level detections must both be listed.
export const MEDIA_CAPTURE_MIME_TYPES = [
  'audio/webm',
  'video/webm',
  'video/x-matroska',
  'audio/mp4',
  'audio/x-m4a',
  'video/mp4',
  'video/quicktime',
  'audio/mpeg',
  'audio/ogg',
  'video/ogg',
  'audio/opus',
  'audio/wav',
  'audio/x-wav',
  'audio/vnd.wave',
  'audio/aac',
  'audio/flac',
] as const;
