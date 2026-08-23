import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type ResolvedTimelineActivityTarget } from 'src/modules/timeline/types/resolved-timeline-activity-target.type';
import { type TimelineActivityRule } from 'src/modules/timeline/types/timeline-activity-rule.type';
import { type TimelineActivityRuleTargetJoinColumn } from 'src/modules/timeline/types/timeline-activity-rule-target-join-column.type';

const readTargetFromRecord = (
  record: Record<string, unknown>,
  targetJoinColumns: TimelineActivityRuleTargetJoinColumn[],
): ResolvedTimelineActivityTarget | undefined => {
  for (const {
    joinColumnName,
    targetObjectNameSingular,
  } of targetJoinColumns) {
    const targetRecordId = record[joinColumnName];

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
      const target = readTargetFromRecord(
        junctionRow,
        rule.targetShape.targetJoinColumns,
      );

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

  resolveTargetFromRecord({
    rule,
    record,
  }: {
    rule: TimelineActivityRule;
    record: Record<string, unknown> | undefined;
  }): ResolvedTimelineActivityTarget | undefined {
    if (!isDefined(record) || rule.targetShape.kind === 'SELF') {
      return undefined;
    }

    return readTargetFromRecord(record, rule.targetShape.targetJoinColumns);
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
