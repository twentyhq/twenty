/* @license Enterprise */

import { Command, Option } from 'nest-commander';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import {
  ProvisionedWorkspaceCommandRunner,
  type ProvisionedWorkspaceCommandOptions,
} from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { AccessGroupPropagationPlanService } from 'src/engine/permissions/internal/access-group/services/access-group-propagation-plan.service';
import { RecordAccessGroupMetadataMapsService } from 'src/engine/permissions/internal/access-group/services/record-access-group-metadata-maps.service';
import { isObjectUsingRecordAccessGroups } from 'src/engine/permissions/internal/access-group/utils/is-object-using-record-access-groups.util';
import { planRecordAccessGroupComputes } from 'src/engine/permissions/internal/access-group/utils/plan-record-access-group-computes.util';

type RecomputeRecordAccessGroupIdsCommandOptions =
  ProvisionedWorkspaceCommandOptions & {
    objectNameSingular?: string[];
  };

@Command({
  name: 'access-groups:recompute-record-access-group-ids',
  description:
    'Plan a full recompute of the access group ids of every record of the objects using access groups, and of the objects they lead to through related record paths',
})
export class RecomputeRecordAccessGroupIdsCommand extends ProvisionedWorkspaceCommandRunner<RecomputeRecordAccessGroupIdsCommandOptions> {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly recordAccessGroupMetadataMapsService: RecordAccessGroupMetadataMapsService,
    private readonly accessGroupPropagationPlanService: AccessGroupPropagationPlanService,
  ) {
    super(workspaceIteratorService);
  }

  @Option({
    flags: '--object-name-singular <objectNameSingular>',
    description:
      'Object to recompute. Can be specified multiple times. Defaults to every object using access groups.',
    required: false,
  })
  parseObjectNameSingular(value: string, previous?: string[]): string[] {
    return [...(previous ?? []), value];
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs<RecomputeRecordAccessGroupIdsCommandOptions>): Promise<void> {
    const metadataMaps =
      await this.recordAccessGroupMetadataMapsService.find(workspaceId);

    const isUsingRecordAccessGroups = (objectMetadataId: string) =>
      isObjectUsingRecordAccessGroups({ ...metadataMaps, objectMetadataId });
    const requestedObjectNamesSingular = options.objectNameSingular ?? [];
    const objectMetadataIds = Object.values(
      metadataMaps.flatObjectMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        ({ nameSingular }) =>
          requestedObjectNamesSingular.length === 0 ||
          requestedObjectNamesSingular.includes(nameSingular),
      )
      .map(({ id }) => id)
      .filter(isUsingRecordAccessGroups);

    if (!isNonEmptyArray(objectMetadataIds)) {
      this.logger.warn(
        `Workspace ${workspaceId}: no object using access groups to recompute`,
      );

      return;
    }

    const plannedObjectMetadataIds = planRecordAccessGroupComputes({
      objectMetadataIds,
      resolvedRelatedRecordPaths: metadataMaps.resolvedRelatedRecordPaths,
      isObjectUsingRecordAccessGroups: isUsingRecordAccessGroups,
    });

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: planning a full access group recompute of ${plannedObjectMetadataIds.length} objects`,
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
