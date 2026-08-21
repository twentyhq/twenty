import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type ResolvedTimelineActivityTarget } from 'src/modules/timeline/types/resolved-timeline-activity-target.type';
import { type TimelineActivityRule } from 'src/modules/timeline/types/timeline-activity-rule.type';

const readTargetFromJunctionRow = (
  junctionRow: Record<string, unknown>,
  rule: TimelineActivityRule,
): ResolvedTimelineActivityTarget | undefined => {
  if (rule.targetShape.kind !== 'JUNCTION') {
    return undefined;
  }

  for (const { joinColumnName, targetObjectNameSingular } of rule.targetShape
    .junctionTargetJoinColumns) {
    const targetRecordId = junctionRow[joinColumnName];

    if (isNonEmptyString(targetRecordId)) {
      return { targetObjectNameSingular, targetRecordId };
    }
  }

  return undefined;
};

@Injectable()
export class TimelineActivityTargetQueryService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  // Source events: walk the junction in one batched query and return, per source
  // record, every record whose timeline receives an entry.
  async resolveTargetsBySourceRecordId({
    rule,
    sourceRecordIds,
    workspaceId,
  }: {
    rule: TimelineActivityRule;
    sourceRecordIds: string[];
    workspaceId: string;
  }): Promise<Map<string, ResolvedTimelineActivityTarget[]>> {
    const targetsBySourceRecordId = new Map<
      string,
      ResolvedTimelineActivityTarget[]
    >();

    if (rule.targetShape.kind !== 'JUNCTION' || sourceRecordIds.length === 0) {
      return targetsBySourceRecordId;
    }

    const { junctionObjectNameSingular, junctionSourceJoinColumnName } =
      rule.targetShape;

    const junctionRepository =
      await this.globalWorkspaceOrmManager.getRepository(
        workspaceId,
        junctionObjectNameSingular,
        { shouldBypassPermissionChecks: true },
      );

    const junctionRows = await junctionRepository.find({
      where: { [junctionSourceJoinColumnName]: In(sourceRecordIds) },
    });

    for (const junctionRow of junctionRows) {
      const sourceRecordId = junctionRow[junctionSourceJoinColumnName];
      const target = readTargetFromJunctionRow(junctionRow, rule);

      if (!isNonEmptyString(sourceRecordId) || !isDefined(target)) {
        continue;
      }

      const targets = targetsBySourceRecordId.get(sourceRecordId);

      if (isDefined(targets)) {
        targets.push(target);
      } else {
        targetsBySourceRecordId.set(sourceRecordId, [target]);
      }
    }

    return targetsBySourceRecordId;
  }

  // Link events: the junction row is the event payload, no query needed.
  resolveTargetFromJunctionRecord({
    rule,
    junctionRecord,
  }: {
    rule: TimelineActivityRule;
    junctionRecord: Record<string, unknown> | undefined;
  }): ResolvedTimelineActivityTarget | undefined {
    if (!isDefined(junctionRecord)) {
      return undefined;
    }

    return readTargetFromJunctionRow(junctionRecord, rule);
  }

  async findSourceRecordsByRecordId({
    rule,
    recordIds,
    workspaceId,
  }: {
    rule: TimelineActivityRule;
    recordIds: string[];
    workspaceId: string;
  }): Promise<Map<string, Record<string, unknown>>> {
    const sourceRecordsByRecordId = new Map<string, Record<string, unknown>>();

    if (recordIds.length === 0) {
      return sourceRecordsByRecordId;
    }

    const repository = await this.globalWorkspaceOrmManager.getRepository(
      workspaceId,
      rule.sourceFlatObjectMetadata.nameSingular,
      { shouldBypassPermissionChecks: true },
    );

    const records = await repository.find({ where: { id: In(recordIds) } });

    for (const record of records) {
      sourceRecordsByRecordId.set(record.id, record);
    }

    return sourceRecordsByRecordId;
  }
}
