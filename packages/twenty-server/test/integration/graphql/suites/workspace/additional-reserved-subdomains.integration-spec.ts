import { checkWorkspaceSubdomainAvailabilityQueryFactory } from 'test/integration/graphql/utils/check-workspace-subdomain-availability-query-factory.util';
import { updateWorkspace } from 'test/integration/graphql/utils/update-workspace.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

describe('Additional reserved subdomains', () => {
  beforeAll(async () => {
    await updateConfigVariable({
      input: {
        key: 'ADDITIONAL_RESERVED_SUBDOMAINS',
        value: ['dedicated-instance', 'Mixed-Case-Instance'],
      },
    });
  });

  afterAll(async () => {
    await updateConfigVariable({
      input: { key: 'ADDITIONAL_RESERVED_SUBDOMAINS', value: [] },
    });
  });

  it.each(['dedicated-instance', 'mixed-case-instance'])(
    'should report %s as taken and suggest other subdomains',
    async (subdomain) => {
      const response = await makeMetadataApiRequest(
        checkWorkspaceSubdomainAvailabilityQueryFactory({ subdomain }),
      );

      expect(response.body.errors).toBeUndefined();

      const availability =
        response.body.data.checkWorkspaceSubdomainAvailability;

      expect(availability.isValid).toBe(true);
      expect(availability.available).toBe(false);
      expect(availability.suggestedSubdomains).not.toHaveLength(0);
      expect(availability.suggestedSubdomains).not.toContain(subdomain);
    },
  );

  it('should leave a subdomain that is not listed available', async () => {
    const response = await makeMetadataApiRequest(
      checkWorkspaceSubdomainAvailabilityQueryFactory({
        subdomain: 'shared-instance',
      }),
    );

    expect(response.body.errors).toBeUndefined();
    expect(
      response.body.data.checkWorkspaceSubdomainAvailability.available,
    ).toBe(true);
  });

  it('should refuse to rename a workspace to a listed subdomain', async () => {
    const { data, errors } = await updateWorkspace({
      data: { subdomain: 'dedicated-instance' },
      expectToFail: true,
    });

    expect(data).toBeNull();
    expect(errors[0].extensions.code).toBe(ErrorCode.CONFLICT);
    expect(errors[0].extensions.userFriendlyMessage).toBe(
      'This subdomain is already taken.',
    );
  });
});
