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

    expect(data.generateApplicationToken).toBeDefined();
    expect(data.generateApplicationToken.token).toBeDefined();
    expect(typeof data.generateApplicationToken.token).toBe('string');
    expect(data.generateApplicationToken.token.length).toBeGreaterThan(0);
    expect(data.generateApplicationToken.expiresAt).toBeDefined();
  });

  it('should generate an application token with API key access token', async () => {
    const { data } = await generateApplicationToken({
      applicationId,
      expectToFail: false,
      token: API_KEY_ACCESS_TOKEN,
    });

    expect(data.generateApplicationToken).toBeDefined();
    expect(data.generateApplicationToken.token).toBeDefined();
    expect(typeof data.generateApplicationToken.token).toBe('string');
    expect(data.generateApplicationToken.token.length).toBeGreaterThan(0);
    expect(data.generateApplicationToken.expiresAt).toBeDefined();
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
