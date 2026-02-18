import { findManyApplications } from 'test/integration/graphql/utils/find-many-applications.util';
import { generateApplicationToken } from 'test/integration/metadata/suites/application/utils/generate-application-token.util';

describe('generateApplicationToken', () => {
  let applicationId: string;

  beforeAll(async () => {
    const { data } = await findManyApplications({
      expectToFail: false,
    });

    const application = data.findManyApplications[0];

    expect(application).toBeDefined();

    applicationId = application.id;
  });

  it('should generate an application token with admin access token', async () => {
    const { data } = await generateApplicationToken({
      applicationId,
      expectToFail: false,
    });

    const tokenPair = data.generateApplicationToken;

    expect(tokenPair).toBeDefined();
    expect(tokenPair.applicationAccessToken).toBeDefined();
    expect(typeof tokenPair.applicationAccessToken.token).toBe('string');
    expect(tokenPair.applicationAccessToken.token.length).toBeGreaterThan(0);
    expect(tokenPair.applicationAccessToken.expiresAt).toBeDefined();
    expect(tokenPair.applicationRefreshToken).toBeDefined();
    expect(typeof tokenPair.applicationRefreshToken.token).toBe('string');
    expect(tokenPair.applicationRefreshToken.expiresAt).toBeDefined();
  });

  it('should generate an application token with API key access token', async () => {
    const { data } = await generateApplicationToken({
      applicationId,
      expectToFail: false,
      token: API_KEY_ACCESS_TOKEN,
    });

    const tokenPair = data.generateApplicationToken;

    expect(tokenPair).toBeDefined();
    expect(tokenPair.applicationAccessToken).toBeDefined();
    expect(typeof tokenPair.applicationAccessToken.token).toBe('string');
    expect(tokenPair.applicationAccessToken.token.length).toBeGreaterThan(0);
    expect(tokenPair.applicationAccessToken.expiresAt).toBeDefined();
    expect(tokenPair.applicationRefreshToken).toBeDefined();
    expect(typeof tokenPair.applicationRefreshToken.token).toBe('string');
    expect(tokenPair.applicationRefreshToken.expiresAt).toBeDefined();
  });

  it('should fail with a non-existent application id', async () => {
    const { errors } = await generateApplicationToken({
      applicationId: '00000000-0000-0000-0000-000000000000',
      expectToFail: true,
    });

    expect(errors).toBeDefined();
    expect(errors.length).toBeGreaterThan(0);
  });
});
