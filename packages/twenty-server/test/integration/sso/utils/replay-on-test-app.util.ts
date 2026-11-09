import request from 'supertest';

// Twenty builds its auth URLs from SERVER_URL, so they are replayed on the test app port
export const replayOnTestApp = (url: URL) =>
  request(`http://localhost:${APP_PORT}`).get(`${url.pathname}${url.search}`);
