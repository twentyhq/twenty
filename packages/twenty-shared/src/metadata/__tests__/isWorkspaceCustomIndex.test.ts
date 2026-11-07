import { isWorkspaceCustomIndex } from '@/metadata/utils/is-workspace-custom-index.util';

const WORKSPACE_CUSTOM_APPLICATION_ID = 'workspace-custom-application-id';

describe('isWorkspaceCustomIndex', () => {
  it('should be true for an index created by the workspace', () => {
    expect(
      isWorkspaceCustomIndex({
        indexMetadata: {
          applicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
          isSystemSideEffect: false,
        },
        workspaceCustomApplicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
      }),
    ).toBe(true);
  });

  it('should be false for an index backing a custom unique field', () => {
    expect(
      isWorkspaceCustomIndex({
        indexMetadata: {
          applicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
          isSystemSideEffect: true,
        },
        workspaceCustomApplicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
      }),
    ).toBe(false);
  });

  it('should be false for an index owned by another application', () => {
    expect(
      isWorkspaceCustomIndex({
        indexMetadata: {
          applicationId: 'standard-application-id',
          isSystemSideEffect: false,
        },
        workspaceCustomApplicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
      }),
    ).toBe(false);
  });

  it('should be false when the workspace custom application is unknown', () => {
    expect(
      isWorkspaceCustomIndex({
        indexMetadata: {
          applicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
          isSystemSideEffect: false,
        },
        workspaceCustomApplicationId: undefined,
      }),
    ).toBe(false);
  });
});
