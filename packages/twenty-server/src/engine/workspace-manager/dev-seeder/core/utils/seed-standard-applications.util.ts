import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/twenty-standard-application';
import { TWENTY_WORKFLOW_APPLICATION } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/twenty-workflow-application';
import { CamelCase } from 'type-fest';

export type SeedStandardApplicationsArgs = {
  applicationService: ApplicationService;
  workspaceId: string;
  applicationsToSeed?: Record<
    | CamelCase<(typeof TWENTY_STANDARD_APPLICATION)['name']>
    | CamelCase<(typeof TWENTY_WORKFLOW_APPLICATION)['name']>,
    boolean
  >;
};
export const seedStandardApplications = async ({
  applicationService,
  workspaceId,
  applicationsToSeed = {
    twentyStandard: true,
    twentyWorkflows: true,
  },
}: SeedStandardApplicationsArgs) => {
  if (applicationsToSeed.twentyStandard) {
    await applicationService.create({
      ...TWENTY_STANDARD_APPLICATION,
      workspaceId,
    });
  }

  if (applicationsToSeed.twentyWorkflows) {
    await applicationService.create({
      ...TWENTY_WORKFLOW_APPLICATION,
      workspaceId,
    });
  }
};
