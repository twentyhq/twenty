// Dispatched (bubbling) from a renderer's canvas when its GL context is
// lost; VisualMount listens on its root to remount the scene by epoch.
export const WEBGL_CONTEXT_LOST_EVENT = 'twenty-webgl-context-lost';
