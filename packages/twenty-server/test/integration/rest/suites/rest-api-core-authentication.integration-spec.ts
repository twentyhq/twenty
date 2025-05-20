import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';

describe('Core REST API Authentication', () => {
  it('should return an UnauthorizedException when no token is provided', async () => {
    await makeRestAPIRequest({
      method: 'post',
      path: `/people`,
      bearer: '',
    })
      .expect(403)
      .expect((res) => {
        expect(res.body.error).toBe('FORBIDDEN_EXCEPTION');
        expect(res.body.messages[0]).toBe('Missing authentication token');
      });
  });

  it('should return an Unauthenticated when an invalid token is provided', async () => {
    await makeRestAPIRequest({
      method: 'post',
      path: `/people`,
      bearer: INVALID_ACCESS_TOKEN,
    })
      .expect(401)
      .expect((res) => {
        expect(res.body.error).toBe('UNAUTHENTICATED');
        expect(res.body.messages[0]).toBe('Token invalid.');
      });
  });

  it('should return an Unauthenticated when no token is provided', async () => {
    await makeRestAPIRequest({
      method: 'post',
      path: `/people`,
      bearer: 'invalid-token',
    })
      .expect(401)
      .expect((res) => {
        expect(res.body.error).toBe('UNAUTHENTICATED');
        expect(res.body.messages[0]).toBe('No payload');
      });
  });

  it('should return an Unauthenticated when an expired token is provided', async () => {
    await makeRestAPIRequest({
      method: 'post',
      path: `/people`,
      bearer: EXPIRED_ACCESS_TOKEN,
    })
      .expect(401)
      .expect((res) => {
        expect(res.body.error).toBe('UNAUTHENTICATED');
        expect(res.body.messages[0]).toBe('Token has expired.');
      });
  });
});
