import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/twenty-standard-application';
import { TWENTY_WORKFLOW_APPLICATION_ID } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/twenty-workflow-application-id';

export const seedStandardApplications = async (
  applicationService: ApplicationService,
  workspaceId: string,
) => {
  await applicationService.create({
    universalIdentifier: TWENTY_STANDARD_APPLICATION.universalIdentifier,
    name: 'Twenty CRM',
    description:
      'Twenty is an open-source CRM that allows you to manage your sales and customer relationships',
    version: '1.0.0',
    sourcePath: 'system/twenty-standard',
    serverlessFunctionLayerId: null,
    workspaceId,
  });

  await applicationService.create({
    universalIdentifier: TWENTY_WORKFLOW_APPLICATION_ID,
    name: 'Twenty Workflows',
    description: 'Workflow automation engine for Twenty CRM',
    version: '1.0.0',
    sourcePath: 'system/twenty-workflow',
    serverlessFunctionLayerId: null,
    workspaceId,
  });
};
