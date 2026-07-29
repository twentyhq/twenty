// A whole batch of upload urls is requested in a single api call, so the
// number of rate-limited calls an app deploy makes scales with this instead of
// with its file count.
export const APPLICATION_FILE_UPLOAD_BATCH_SIZE = 100;
