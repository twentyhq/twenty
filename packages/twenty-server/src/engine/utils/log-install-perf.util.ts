// Temporary [install-perf] instrumentation (#21365) used to debug app-install
// latency. Kept on by default so real environments keep emitting it, but it
// floods noisy environments like integration tests — set
// INSTALL_PERF_LOGGING_ENABLED=false there (see .env.test) to mute it.
export const isInstallPerfLoggingEnabled = (): boolean =>
  process.env.INSTALL_PERF_LOGGING_ENABLED !== 'false';
