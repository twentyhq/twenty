import { type RawAuthContext } from 'src/engine/core-modules/auth/types/raw-auth-context.type';
import { buildApiKeyAuthContext } from 'src/engine/core-modules/auth/utils/build-api-key-auth-context.util';
import { buildSystemAuthContext } from 'src/engine/core-modules/auth/utils/build-system-auth-context.util';
import { buildUserAuthContext } from 'src/engine/core-modules/auth/utils/build-user-auth-context.util';
import { PRIVATABLE_ENTITY_PRIVACY_CHANGE_NOT_ALLOWED_CODE } from 'src/engine/permissions/metadata-permissions/constants/privatable-entity-privacy-change-not-allowed-code.constant';
import { getPrivatableEntityPrivacyValidationErrors } from 'src/engine/permissions/metadata-permissions/utils/get-privatable-entity-privacy-validation-errors.util';

const CREATOR_USER_WORKSPACE_ID = 'creator-user-workspace';
const OTHER_USER_WORKSPACE_ID = 'other-user-workspace';

const workspace = { id: 'workspace-1' } as NonNullable<
  RawAuthContext['workspace']
>;

const buildMemberAuthContext = (userWorkspaceId: string) =>
  buildUserAuthContext({
    workspace,
    userWorkspaceId,
    user: { id: 'user-1' } as NonNullable<RawAuthContext['user']>,
    workspaceMemberId: 'workspace-member-1',
    workspaceMember: { id: 'workspace-member-1' } as NonNullable<
      RawAuthContext['workspaceMember']
    >,
    userSessionVariant: 'standard',
  });

const buildWorkflow = ({
  isPrivate,
  createdByUserWorkspaceId,
}: {
  isPrivate: boolean;
  createdByUserWorkspaceId: string | null;
}) => ({
  applicationUniversalIdentifier: 'application-1',
  isPrivate,
  createdByUserWorkspaceId,
});

const isRefused = (errors: { code: string }[]) =>
  errors.some(
    ({ code }) => code === PRIVATABLE_ENTITY_PRIVACY_CHANGE_NOT_ALLOWED_CODE,
  );

describe('getPrivatableEntityPrivacyValidationErrors', () => {
  it('ignores metadata that cannot be private', () => {
    expect(
      getPrivatableEntityPrivacyValidationErrors({
        metadataName: 'objectMetadata',
        toUniversalFlatEntity: buildWorkflow({
          isPrivate: true,
          createdByUserWorkspaceId: null,
        }),
        authContext: undefined,
      }),
    ).toEqual([]);
  });

  describe('on creation', () => {
    it('accepts a shared entity with no creator, even with no caller', () => {
      expect(
        getPrivatableEntityPrivacyValidationErrors({
          metadataName: 'workflow',
          toUniversalFlatEntity: buildWorkflow({
            isPrivate: false,
            createdByUserWorkspaceId: null,
          }),
          authContext: undefined,
        }),
      ).toEqual([]);
    });

    it('accepts a private entity created by the calling member', () => {
      expect(
        getPrivatableEntityPrivacyValidationErrors({
          metadataName: 'agent',
          toUniversalFlatEntity: buildWorkflow({
            isPrivate: true,
            createdByUserWorkspaceId: CREATOR_USER_WORKSPACE_ID,
          }),
          authContext: buildMemberAuthContext(CREATOR_USER_WORKSPACE_ID),
        }),
      ).toEqual([]);
    });

    it('refuses a private entity with no creator, as an app manifest would declare it', () => {
      expect(
        isRefused(
          getPrivatableEntityPrivacyValidationErrors({
            metadataName: 'workflow',
            toUniversalFlatEntity: buildWorkflow({
              isPrivate: true,
              createdByUserWorkspaceId: null,
            }),
            authContext: buildMemberAuthContext(CREATOR_USER_WORKSPACE_ID),
          }),
        ),
      ).toBe(true);
    });

    it('refuses an entity attributed to another member', () => {
      expect(
        isRefused(
          getPrivatableEntityPrivacyValidationErrors({
            metadataName: 'workflow',
            toUniversalFlatEntity: buildWorkflow({
              isPrivate: false,
              createdByUserWorkspaceId: OTHER_USER_WORKSPACE_ID,
            }),
            authContext: buildMemberAuthContext(CREATOR_USER_WORKSPACE_ID),
          }),
        ),
      ).toBe(true);
    });

    it('lets the system create a private entity for anyone', () => {
      expect(
        getPrivatableEntityPrivacyValidationErrors({
          metadataName: 'workflow',
          toUniversalFlatEntity: buildWorkflow({
            isPrivate: true,
            createdByUserWorkspaceId: OTHER_USER_WORKSPACE_ID,
          }),
          authContext: buildSystemAuthContext({ workspace }),
        }),
      ).toEqual([]);
    });
  });

  describe('on update', () => {
    const sharedWorkflowOfCreator = buildWorkflow({
      isPrivate: false,
      createdByUserWorkspaceId: CREATOR_USER_WORKSPACE_ID,
    });
    const privateWorkflowOfCreator = buildWorkflow({
      isPrivate: true,
      createdByUserWorkspaceId: CREATOR_USER_WORKSPACE_ID,
    });

    it('accepts any update that leaves the privacy alone', () => {
      expect(
        getPrivatableEntityPrivacyValidationErrors({
          metadataName: 'workflow',
          fromUniversalFlatEntity: sharedWorkflowOfCreator,
          toUniversalFlatEntity: sharedWorkflowOfCreator,
          authContext: buildMemberAuthContext(OTHER_USER_WORKSPACE_ID),
        }),
      ).toEqual([]);
    });

    it('lets the creator make the entity private', () => {
      expect(
        getPrivatableEntityPrivacyValidationErrors({
          metadataName: 'workflow',
          fromUniversalFlatEntity: sharedWorkflowOfCreator,
          toUniversalFlatEntity: privateWorkflowOfCreator,
          authContext: buildMemberAuthContext(CREATOR_USER_WORKSPACE_ID),
        }),
      ).toEqual([]);
    });

    it('refuses making an entity with no creator private', () => {
      expect(
        isRefused(
          getPrivatableEntityPrivacyValidationErrors({
            metadataName: 'workflow',
            fromUniversalFlatEntity: buildWorkflow({
              isPrivate: false,
              createdByUserWorkspaceId: null,
            }),
            toUniversalFlatEntity: buildWorkflow({
              isPrivate: true,
              createdByUserWorkspaceId: null,
            }),
            authContext: buildMemberAuthContext(OTHER_USER_WORKSPACE_ID),
          }),
        ),
      ).toBe(true);
    });

    it('refuses another member taking over the entity', () => {
      expect(
        isRefused(
          getPrivatableEntityPrivacyValidationErrors({
            metadataName: 'workflow',
            fromUniversalFlatEntity: sharedWorkflowOfCreator,
            toUniversalFlatEntity: buildWorkflow({
              isPrivate: true,
              createdByUserWorkspaceId: OTHER_USER_WORKSPACE_ID,
            }),
            authContext: buildMemberAuthContext(OTHER_USER_WORKSPACE_ID),
          }),
        ),
      ).toBe(true);
    });

    it('refuses a privacy change from a caller that is not a member, or from no caller', () => {
      for (const authContext of [
        buildApiKeyAuthContext({
          workspace,
          apiKey: { id: 'api-key-1' } as NonNullable<RawAuthContext['apiKey']>,
        }),
        undefined,
      ]) {
        expect(
          isRefused(
            getPrivatableEntityPrivacyValidationErrors({
              metadataName: 'workflow',
              fromUniversalFlatEntity: privateWorkflowOfCreator,
              toUniversalFlatEntity: sharedWorkflowOfCreator,
              authContext,
            }),
          ),
        ).toBe(true);
      }
    });
  });
});
