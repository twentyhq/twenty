import { type MetadataEvent } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/metadata-event.type';
import { getDeletedInstalledApplicationWorkflowIds } from 'src/modules/workflow/workflow-runner/utils/get-deleted-installed-application-workflow-ids.util';

const CUSTOM_APPLICATION_ID = 'custom-application-id';
const STANDARD_APPLICATION_ID = 'standard-application-id';
const INSTALLED_APPLICATION_ID = 'installed-application-id';

const buildWorkflowEvent = ({
  type,
  workflowId,
  applicationId,
}: {
  type: MetadataEvent['type'];
  workflowId: string;
  applicationId: string;
}) =>
  ({
    type,
    metadataName: 'workflow',
    recordId: workflowId,
    properties: {
      before: { id: workflowId, applicationId },
      after: { id: workflowId, applicationId },
    },
  }) as unknown as MetadataEvent;

describe('getDeletedInstalledApplicationWorkflowIds', () => {
  it('keeps only the deleted workflows of installed applications', () => {
    expect(
      getDeletedInstalledApplicationWorkflowIds({
        events: [
          buildWorkflowEvent({
            type: 'deleted',
            workflowId: 'installed-workflow',
            applicationId: INSTALLED_APPLICATION_ID,
          }),
          buildWorkflowEvent({
            type: 'deleted',
            workflowId: 'workspace-workflow',
            applicationId: CUSTOM_APPLICATION_ID,
          }),
          buildWorkflowEvent({
            type: 'deleted',
            workflowId: 'standard-workflow',
            applicationId: STANDARD_APPLICATION_ID,
          }),
          buildWorkflowEvent({
            type: 'updated',
            workflowId: 'updated-installed-workflow',
            applicationId: INSTALLED_APPLICATION_ID,
          }),
        ],
        workspaceOwnedApplicationIds: [
          CUSTOM_APPLICATION_ID,
          STANDARD_APPLICATION_ID,
        ],
      }),
    ).toEqual(['installed-workflow']);
  });

  it('returns nothing when only workspace workflows were deleted', () => {
    expect(
      getDeletedInstalledApplicationWorkflowIds({
        events: [
          buildWorkflowEvent({
            type: 'deleted',
            workflowId: 'workspace-workflow',
            applicationId: CUSTOM_APPLICATION_ID,
          }),
        ],
        workspaceOwnedApplicationIds: [
          CUSTOM_APPLICATION_ID,
          STANDARD_APPLICATION_ID,
        ],
      }),
    ).toEqual([]);
  });
});
