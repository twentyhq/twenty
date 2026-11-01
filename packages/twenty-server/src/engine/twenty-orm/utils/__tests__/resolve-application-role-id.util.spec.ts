import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { resolveApplicationRoleId } from 'src/engine/twenty-orm/utils/resolve-application-role-id.util';

const APPROVED_ROLE_REQUEST = {
  universalIdentifier: 'requested-role-universal-identifier',
  label: 'Requested role',
};

describe('resolveApplicationRoleId', () => {
  it.each([true, false])(
    'restricts a confined application to its grant (missing role tolerated: %s)',
    (isMissingApplicationRoleTolerated) => {
      expect(
        resolveApplicationRoleId({
          application: {
            sourceType: ApplicationRegistrationSourceType.NPM,
            defaultRoleId: 'requested-role-id',
            runtimeRoleId: 'grant-role-id',
            isGrantExempt: false,
            approvedRoleRequest: APPROVED_ROLE_REQUEST,
          },
          isMissingApplicationRoleTolerated,
        }),
      ).toEqual({ applicationRoleId: 'grant-role-id' });
    },
  );

  it('never uses the requested role of a confined application', () => {
    expect(
      resolveApplicationRoleId({
        application: {
          sourceType: ApplicationRegistrationSourceType.NPM,
          defaultRoleId: 'requested-role-id',
          approvedRoleRequest: APPROVED_ROLE_REQUEST,
        },
        isMissingApplicationRoleTolerated: true,
      }),
    ).toEqual({ applicationRoleId: null });
  });

  it('denies a confined application without a grant even when a missing role is tolerated', () => {
    expect(
      resolveApplicationRoleId({
        application: {
          sourceType: ApplicationRegistrationSourceType.NPM,
          defaultRoleId: 'requested-role-id',
          runtimeRoleId: null,
          isGrantExempt: false,
          approvedRoleRequest: null,
        },
        isMissingApplicationRoleTolerated: true,
      }),
    ).toEqual({ applicationRoleId: null });
  });

  it('restricts an exempt application to its own role', () => {
    expect(
      resolveApplicationRoleId({
        application: {
          sourceType: ApplicationRegistrationSourceType.NPM,
          defaultRoleId: 'own-role-id',
          runtimeRoleId: 'own-role-id',
          isGrantExempt: true,
          approvedRoleRequest: null,
        },
        isMissingApplicationRoleTolerated: false,
      }),
    ).toEqual({ applicationRoleId: 'own-role-id' });
  });

  it('adds no restriction for an exempt application without a role when a missing role is tolerated', () => {
    expect(
      resolveApplicationRoleId({
        application: {
          sourceType: ApplicationRegistrationSourceType.NPM,
          defaultRoleId: null,
          runtimeRoleId: null,
          isGrantExempt: true,
          approvedRoleRequest: null,
        },
        isMissingApplicationRoleTolerated: true,
      }),
    ).toEqual({});
  });

  it('denies an exempt application without a role when a missing role is not tolerated', () => {
    expect(
      resolveApplicationRoleId({
        application: {
          sourceType: ApplicationRegistrationSourceType.NPM,
          defaultRoleId: null,
          isGrantExempt: true,
          approvedRoleRequest: null,
        },
        isMissingApplicationRoleTolerated: false,
      }),
    ).toEqual({ applicationRoleId: null });
  });

  it('adds no restriction for an OAuth client acting for a user', () => {
    expect(
      resolveApplicationRoleId({
        application: {
          sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
          defaultRoleId: null,
          runtimeRoleId: null,
          isGrantExempt: false,
          approvedRoleRequest: null,
        },
        isMissingApplicationRoleTolerated: true,
      }),
    ).toEqual({});
  });

  it('denies an OAuth client acting alone', () => {
    expect(
      resolveApplicationRoleId({
        application: {
          sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
          defaultRoleId: null,
          isGrantExempt: false,
          approvedRoleRequest: null,
        },
        isMissingApplicationRoleTolerated: false,
      }),
    ).toEqual({ applicationRoleId: null });
  });

  it('adds no restriction without an application', () => {
    expect(
      resolveApplicationRoleId({
        application: undefined,
        isMissingApplicationRoleTolerated: true,
      }),
    ).toEqual({});
  });
});
