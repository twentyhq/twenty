import request from 'supertest';
import { isDefined } from 'twenty-shared/utils';

// Twenty builds its auth URLs from SERVER_URL, so they are replayed on the test app port
export const replayOnTestApp = (
  url: URL,
  { form }: { form?: Record<string, string> } = {},
) => {
  const path = `${url.pathname}${url.search}`;
  const testApp = request(`http://localhost:${APP_PORT}`);

  return isDefined(form)
    ? testApp.post(path).type('form').send(form)
    : testApp.get(path);
};
