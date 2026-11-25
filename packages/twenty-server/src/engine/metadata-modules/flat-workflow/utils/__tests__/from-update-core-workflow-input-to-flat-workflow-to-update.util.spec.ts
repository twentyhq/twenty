import { type FlatWorkflow } from 'src/engine/metadata-modules/flat-workflow/types/flat-workflow.type';
import { fromUpdateCoreWorkflowInputToFlatWorkflowToUpdate } from 'src/engine/metadata-modules/flat-workflow/utils/from-update-core-workflow-input-to-flat-workflow-to-update.util';

const CREATOR_USER_WORKSPACE_ID = '20202020-0000-4000-8000-000000000001';
const OTHER_USER_WORKSPACE_ID = '20202020-0000-4000-8000-000000000002';

const existingFlatWorkflow: FlatWorkflow = {
  id: '20202020-0000-4000-8000-000000000003',
  universalIdentifier: '20202020-0000-4000-8000-000000000004',
  workspaceId: '20202020-0000-4000-8000-000000000005',
  applicationId: '20202020-0000-4000-8000-000000000006',
  applicationUniversalIdentifier: '20202020-0000-4000-8000-000000000007',
  name: 'Onboarding',
  versionDefinitionHash: null,
  lastPublishedCoreWorkflowVersionId: null,
  workspaceWorkflowId: null,
  isSystem: false,
  isPrivate: false,
  createdByUserWorkspaceId: CREATOR_USER_WORKSPACE_ID,
  navigationMenuItemIds: [],
  navigationMenuItemUniversalIdentifiers: [],
  createdAt: '2026-11-12T00:00:00.000Z',
  updatedAt: '2026-11-12T00:00:00.000Z',
};

describe('fromUpdateCoreWorkflowInputToFlatWorkflowToUpdate', () => {
  it('should leave the workflow unchanged when nothing is provided', () => {
    expect(
      fromUpdateCoreWorkflowInputToFlatWorkflowToUpdate({
        existingFlatWorkflow,
        userWorkspaceId: OTHER_USER_WORKSPACE_ID,
      }),
    ).toEqual(existingFlatWorkflow);
  });

  it('should rename without touching the privacy or the creator', () => {
    expect(
      fromUpdateCoreWorkflowInputToFlatWorkflowToUpdate({
        existingFlatWorkflow,
        name: 'Offboarding',
        userWorkspaceId: OTHER_USER_WORKSPACE_ID,
      }),
    ).toEqual({ ...existingFlatWorkflow, name: 'Offboarding' });
  });

  it('should rename for a caller that is not a workspace member', () => {
    expect(
      fromUpdateCoreWorkflowInputToFlatWorkflowToUpdate({
        existingFlatWorkflow,
        name: 'Offboarding',
        userWorkspaceId: undefined,
      }),
    ).toEqual({ ...existingFlatWorkflow, name: 'Offboarding' });
  });

  it('should make an ownerless workflow private and set the caller as its creator', () => {
    expect(
      fromUpdateCoreWorkflowInputToFlatWorkflowToUpdate({
        existingFlatWorkflow: {
          ...existingFlatWorkflow,
          createdByUserWorkspaceId: null,
        },
        isPrivate: true,
        userWorkspaceId: OTHER_USER_WORKSPACE_ID,
      }),
    ).toEqual({
      ...existingFlatWorkflow,
      isPrivate: true,
      createdByUserWorkspaceId: OTHER_USER_WORKSPACE_ID,
    });
  });

  it('should let a member claim an ownerless workflow without changing its privacy', () => {
    expect(
      fromUpdateCoreWorkflowInputToFlatWorkflowToUpdate({
        existingFlatWorkflow: {
          ...existingFlatWorkflow,
          createdByUserWorkspaceId: null,
        },
        isPrivate: false,
        userWorkspaceId: OTHER_USER_WORKSPACE_ID,
      }),
    ).toEqual({
      ...existingFlatWorkflow,
      createdByUserWorkspaceId: OTHER_USER_WORKSPACE_ID,
    });
  });

  it('should apply the name and the privacy together for the creator', () => {
    expect(
      fromUpdateCoreWorkflowInputToFlatWorkflowToUpdate({
        existingFlatWorkflow,
        name: 'Offboarding',
        isPrivate: true,
        userWorkspaceId: CREATOR_USER_WORKSPACE_ID,
      }),
    ).toEqual({
      ...existingFlatWorkflow,
      name: 'Offboarding',
      isPrivate: true,
    });
  });

  it('should keep the existing creator when the caller is not a workspace member', () => {
    expect(
      fromUpdateCoreWorkflowInputToFlatWorkflowToUpdate({
        existingFlatWorkflow,
        isPrivate: true,
        userWorkspaceId: undefined,
      }),
    ).toEqual({ ...existingFlatWorkflow, isPrivate: true });
  });
});
