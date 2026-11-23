import { type FlatWorkflow } from 'src/engine/metadata-modules/flat-workflow/types/flat-workflow.type';
import { fromUpdateCoreWorkflowInputToFlatWorkflowToUpdateOrThrow } from 'src/engine/metadata-modules/flat-workflow/utils/from-update-core-workflow-input-to-flat-workflow-to-update-or-throw.util';
import { WorkflowQueryValidationException } from 'src/modules/workflow/common/exceptions/workflow-query-validation.exception';

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
  lastPublishedVersionId: null,
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

describe('fromUpdateCoreWorkflowInputToFlatWorkflowToUpdateOrThrow', () => {
  it('should leave the workflow unchanged when nothing is provided', () => {
    expect(
      fromUpdateCoreWorkflowInputToFlatWorkflowToUpdateOrThrow({
        existingFlatWorkflow,
        userWorkspaceId: OTHER_USER_WORKSPACE_ID,
      }),
    ).toEqual(existingFlatWorkflow);
  });

  it('should rename without touching the privacy or the creator', () => {
    expect(
      fromUpdateCoreWorkflowInputToFlatWorkflowToUpdateOrThrow({
        existingFlatWorkflow,
        name: 'Offboarding',
        userWorkspaceId: OTHER_USER_WORKSPACE_ID,
      }),
    ).toEqual({ ...existingFlatWorkflow, name: 'Offboarding' });
  });

  it('should rename for a caller that is not a workspace member', () => {
    expect(
      fromUpdateCoreWorkflowInputToFlatWorkflowToUpdateOrThrow({
        existingFlatWorkflow,
        name: 'Offboarding',
        userWorkspaceId: undefined,
      }),
    ).toEqual({ ...existingFlatWorkflow, name: 'Offboarding' });
  });

  it('should set the caller as the creator when the privacy is provided', () => {
    expect(
      fromUpdateCoreWorkflowInputToFlatWorkflowToUpdateOrThrow({
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

  it('should set the caller as the creator even when the privacy does not change', () => {
    expect(
      fromUpdateCoreWorkflowInputToFlatWorkflowToUpdateOrThrow({
        existingFlatWorkflow,
        isPrivate: false,
        userWorkspaceId: OTHER_USER_WORKSPACE_ID,
      }),
    ).toEqual({
      ...existingFlatWorkflow,
      createdByUserWorkspaceId: OTHER_USER_WORKSPACE_ID,
    });
  });

  it('should apply the name and the privacy together', () => {
    expect(
      fromUpdateCoreWorkflowInputToFlatWorkflowToUpdateOrThrow({
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

  it('should refuse a privacy change from a caller that is not a workspace member', () => {
    expect(() =>
      fromUpdateCoreWorkflowInputToFlatWorkflowToUpdateOrThrow({
        existingFlatWorkflow,
        isPrivate: true,
        userWorkspaceId: undefined,
      }),
    ).toThrow(WorkflowQueryValidationException);
  });
});
