/* @license Enterprise */

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { AccessGroupPropagationPlanService } from 'src/engine/permissions/internal/access-group/services/access-group-propagation-plan.service';
import { RecordAccessGroupMetadataMapsService } from 'src/engine/permissions/internal/access-group/services/record-access-group-metadata-maps.service';
import { isAccessGroupsEnabled } from 'src/engine/permissions/internal/access-group/utils/is-access-groups-enabled.util';
import { isObjectUsingRecordAccessGroups } from 'src/engine/permissions/internal/access-group/utils/is-object-using-record-access-groups.util';
import { planRecordAccessGroupComputes } from 'src/engine/permissions/internal/access-group/utils/plan-record-access-group-computes.util';

@Command({
  name: 'access-groups:recompute-record-access-group-ids',
  description:
    'Plan a full recompute of the access group ids of every record of the objects using access groups',
})
export class RecomputeRecordAccessGroupIdsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly recordAccessGroupMetadataMapsService: RecordAccessGroupMetadataMapsService,
    private readonly accessGroupPropagationPlanService: AccessGroupPropagationPlanService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const metadataMaps =
      await this.recordAccessGroupMetadataMapsService.find(workspaceId);

    if (!isAccessGroupsEnabled(metadataMaps)) {
      return;
    }

    const isUsingRecordAccessGroups = (objectMetadataId: string) =>
      isObjectUsingRecordAccessGroups({ ...metadataMaps, objectMetadataId });
    const objectMetadataIds = Object.values(
      metadataMaps.flatObjectMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .map(({ id }) => id)
      .filter(isUsingRecordAccessGroups);
    const plannedObjectMetadataIds = planRecordAccessGroupComputes({
      objectMetadataIds,
      resolvedRelatedRecordPaths: metadataMaps.resolvedRelatedRecordPaths,
      isObjectUsingRecordAccessGroups: isUsingRecordAccessGroups,
    });

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: planning a full access group recompute of ${objectMetadataIds.length} objects`,
    );

    if (options.dryRun) {
      return;
    }

    await this.accessGroupPropagationPlanService.persistPlanSteps({
      workspaceId,
      steps: plannedObjectMetadataIds.map((objectMetadataId) => ({
        objectMetadataId,
      })),
    });
  }
}
