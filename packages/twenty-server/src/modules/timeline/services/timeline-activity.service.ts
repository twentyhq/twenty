import { Injectable, Logger } from '@nestjs/common';

import { type ObjectRecordBaseEvent } from 'twenty-shared/database-events';
import { FieldMetadataType, type ObjectRecord } from 'twenty-shared/types';
import { isNonEmptyString } from '@sniptt/guards';
import { fromArrayToValuesByKeyRecord, isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { type DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { parseEventNameOrThrow } from 'src/engine/workspace-event-emitter/utils/parse-event-name';
import { TimelineActivityRepository } from 'src/modules/timeline/repositories/timeline-activity.repository';
import { TimelineActivityRuleBuilderService } from 'src/modules/timeline/services/timeline-activity-rule-builder.service';
import { type TimelineActivityTypeResolver } from 'src/modules/timeline/utils/resolve-timeline-activity-type-id.util';
import { TimelineActivityTargetQueryService } from 'src/modules/timeline/services/timeline-activity-target-query.service';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { type ResolvedTimelineActivityTarget } from 'src/modules/timeline/types/resolved-timeline-activity-target.type';
import { type TimelineActivityPayload } from 'src/modules/timeline/types/timeline-activity-payload';
import { type TimelineActivityRuleAction } from 'src/modules/timeline/types/timeline-activity-rule-action.type';
import { type TimelineActivityRule } from 'src/modules/timeline/types/timeline-activity-rule.type';
import { resolveLinkedRecordCachedName } from 'src/modules/timeline/utils/resolve-linked-record-cached-name.util';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

// An event on the junction object is a change to the link, not to the linked
// record. `updated` covers a junction row being repointed at another target.
const JUNCTION_EVENT_ACTIONS: Partial<
  Record<DatabaseEventAction, TimelineActivityRuleAction>
> = {
  created: 'linked',
  restored: 'linked',
  updated: 'linked',
  deleted: 'unlinked',
};

const SOURCE_EVENT_ACTIONS: Partial<
  Record<DatabaseEventAction, TimelineActivityRuleAction>
> = {
  created: 'created',
  updated: 'updated',
  deleted: 'deleted',
  restored: 'restored',
};

// Only the diff is worth storing: the rest of an event payload is the record
// itself, which the timeline reads live.
const keepDiffOnly = (
  properties: ObjectRecordBaseEvent['properties'],
): Pick<ObjectRecordBaseEvent['properties'], 'diff'> => {
  const { diff } = properties;

  return isDefined(diff) && Object.keys(diff).length > 0 ? { diff } : {};
};

// Both event streams write the same row shape; only the linked record, its
// cached name and the persisted properties differ.
const buildLinkedPayload = ({
  rule,
  name,
  timelineActivityTypeId,
  target,
  workspaceMemberId,
  linkedRecordId,
  linkedRecordCachedName,
  properties,
}: {
  rule: TimelineActivityRule;
  name: string;
  timelineActivityTypeId: string;
  target: ResolvedTimelineActivityTarget;
  workspaceMemberId: string | undefined;
  linkedRecordId: string;
  linkedRecordCachedName: string | undefined;
  properties: ObjectRecordBaseEvent['properties'];
}): TimelineActivityPayload => ({
  name,
  timelineActivityTypeId,
  objectSingularName: target.targetObjectNameSingular,
  recordId: target.targetRecordId,
  workspaceMemberId,
  linkedRecordId,
  linkedObjectMetadataId: rule.sourceFlatObjectMetadata.id,
  linkedRecordCachedName,
  properties: keepDiffOnly(properties),
});

@Injectable()
export class TimelineActivityService {
  private readonly logger = new Logger(TimelineActivityService.name);

  constructor(
    @InjectObjectMetadataRepository(TimelineActivityWorkspaceEntity)
    private readonly timelineActivityRepository: TimelineActivityRepository,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly timelineActivityRuleBuilderService: TimelineActivityRuleBuilderService,
    private readonly timelineActivityTargetQueryService: TimelineActivityTargetQueryService,
  ) {}

  async upsertEvents({
    events,
    name,
    objectMetadata,
    workspaceId,
  }: WorkspaceEventBatch<ObjectRecordBaseEvent>) {
    if (!isDefined(workspaceId)) {
      return;
    }

    const { action } = parseEventNameOrThrow(name);

    const {
      sourceRules,
      junctionRules,
      flatFieldMetadataMaps,
      resolveTimelineActivityTypeId,
    } = await this.timelineActivityRuleBuilderService.getRulesForEventBatch({
      workspaceId,
      flatObjectMetadata: objectMetadata,
    });

    if (sourceRules.length === 0 && junctionRules.length === 0) {
      return;
    }

    const eventsWithoutPositionDiff = this.excludePositionFieldsFromEventsDiff({
      events,
      objectMetadata,
      flatFieldMetadataMaps,
    });

    const payloads = (
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          // Resolved after the rule check so batches without rules, system
          // objects mostly, never pay the workspace member query.
          const enrichedEvents = await this.enrichEventsWithWorkspaceMemberId({
            events: eventsWithoutPositionDiff,
            workspaceId,
          });

          return Promise.all([
            ...sourceRules.map((rule) =>
              this.buildPayloadsForSourceRule({
                rule,
                events: enrichedEvents,
                action,
                workspaceId,
                flatFieldMetadataMaps,
                resolveTimelineActivityTypeId,
              }),
            ),
            ...junctionRules.map((rule) =>
              this.buildPayloadsForJunctionRule({
                rule,
                events: enrichedEvents,
                action,
                workspaceId,
                flatFieldMetadataMaps,
                resolveTimelineActivityTypeId,
              }),
            ),
          ]);
        },
        buildSystemAuthContext(workspaceId),
      )
    ).flat();

    if (payloads.length === 0) {
      return;
    }

    const payloadsByObjectSingularName = fromArrayToValuesByKeyRecord({
      array: payloads,
      key: 'objectSingularName',
    });

    for (const objectSingularName in payloadsByObjectSingularName) {
      await this.timelineActivityRepository.upsertTimelineActivities({
        objectSingularName,
        workspaceId,
        payloads: payloadsByObjectSingularName[objectSingularName],
      });
    }
  }

  private ruleMatchesEvent({
    rule,
    ruleAction,
    event,
  }: {
    rule: TimelineActivityRule;
    ruleAction: TimelineActivityRuleAction;
    event: ObjectRecordBaseEvent;
  }): boolean {
    if (!rule.actions.includes(ruleAction)) {
      return false;
    }

    if (ruleAction !== 'updated' || !isDefined(rule.triggerFieldNames)) {
      return true;
    }

    const diff = event.properties.diff;

    if (!isDefined(diff)) {
      return false;
    }

    return rule.triggerFieldNames.some((fieldName) =>
      isDefined((diff as Record<string, unknown>)[fieldName]),
    );
  }

  private async buildPayloadsForSourceRule({
    rule,
    events,
    action,
    workspaceId,
    flatFieldMetadataMaps,
    resolveTimelineActivityTypeId,
  }: {
    rule: TimelineActivityRule;
    events: ObjectRecordBaseEvent[];
    action: DatabaseEventAction;
    workspaceId: string;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    resolveTimelineActivityTypeId: TimelineActivityTypeResolver;
  }): Promise<TimelineActivityPayload[]> {
    const ruleAction = SOURCE_EVENT_ACTIONS[action];

    if (!isDefined(ruleAction)) {
      return [];
    }

    // A self rule writes the record's own row, which carries no linked record,
    // so it must not take the object-bound type: that one renders as a linked
    // entry and has no linked object to draw.
    const timelineActivityTypeId = resolveTimelineActivityTypeId({
      action: ruleAction,
      objectUniversalIdentifier:
        rule.targetShape.kind === 'SELF'
          ? undefined
          : rule.sourceFlatObjectMetadata.universalIdentifier,
    });

    if (!isDefined(timelineActivityTypeId)) {
      this.logger.warn(
        `No timeline activity type resolves ${ruleAction} on ${rule.sourceFlatObjectMetadata.nameSingular} in workspace ${workspaceId}, dropping ${events.length} events`,
      );

      return [];
    }

    const matchingEvents = events.filter((event) =>
      this.ruleMatchesEvent({ rule, ruleAction, event }),
    );

    if (matchingEvents.length === 0) {
      return [];
    }

    const { nameSingular } = rule.sourceFlatObjectMetadata;

    if (rule.targetShape.kind === 'SELF') {
      return matchingEvents.flatMap((event) => {
        const properties =
          ruleAction === 'updated' ? keepDiffOnly(event.properties) : {};

        // An update whose whole diff was filtered out has nothing to show
        if (ruleAction === 'updated' && !isDefined(properties.diff)) {
          return [];
        }

        return [
          {
            name: `${nameSingular}.${action}`,
            timelineActivityTypeId,
            objectSingularName: nameSingular,
            recordId: event.recordId,
            workspaceMemberId: event.workspaceMemberId,
            properties,
          },
        ];
      });
    }

    const targetsBySourceRecordId =
      await this.timelineActivityTargetQueryService.resolveTargetsBySourceRecordId(
        {
          rule,
          sourceRecordIds: matchingEvents.map((event) => event.recordId),
          workspaceId,
        },
      );

    return matchingEvents.flatMap((event) =>
      (targetsBySourceRecordId.get(event.recordId) ?? []).map((target) =>
        buildLinkedPayload({
          rule,
          name: `linked-${rule.sourceFlatObjectMetadata.nameSingular}.${action}`,
          timelineActivityTypeId,
          target,
          workspaceMemberId: event.workspaceMemberId,
          linkedRecordId: event.recordId,
          linkedRecordCachedName: resolveLinkedRecordCachedName({
            rule,
            record: event.properties.after as ObjectRecord | undefined,
            flatFieldMetadataMaps,
          }),
          properties: event.properties,
        }),
      ),
    );
  }

  private async buildPayloadsForJunctionRule({
    rule,
    events,
    action,
    workspaceId,
    flatFieldMetadataMaps,
    resolveTimelineActivityTypeId,
  }: {
    rule: TimelineActivityRule;
    events: ObjectRecordBaseEvent[];
    action: DatabaseEventAction;
    workspaceId: string;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    resolveTimelineActivityTypeId: TimelineActivityTypeResolver;
  }): Promise<TimelineActivityPayload[]> {
    const ruleAction = JUNCTION_EVENT_ACTIONS[action];

    if (!isDefined(ruleAction) || rule.targetShape.kind !== 'JUNCTION') {
      return [];
    }

    const timelineActivityTypeId = resolveTimelineActivityTypeId({
      action: ruleAction,
      objectUniversalIdentifier:
        rule.sourceFlatObjectMetadata.universalIdentifier,
    });

    if (!isDefined(timelineActivityTypeId)) {
      this.logger.warn(
        `No timeline activity type resolves ${ruleAction} on ${rule.sourceFlatObjectMetadata.nameSingular} in workspace ${workspaceId}, dropping ${events.length} events`,
      );

      return [];
    }

    const { junctionSourceJoinColumnName } = rule.targetShape;

    const eventsWithJunctionRecord = events
      .filter((event) => this.ruleMatchesEvent({ rule, ruleAction, event }))
      .map((event) => {
        const junctionRecord = event.properties.after as
          | ObjectRecord
          | undefined;

        const target =
          this.timelineActivityTargetQueryService.resolveTargetFromJunctionRecord(
            { rule, junctionRecord },
          );

        const sourceRecordId = junctionRecord?.[junctionSourceJoinColumnName];

        if (!isDefined(target) || !isNonEmptyString(sourceRecordId)) {
          return undefined;
        }

        return { event, target, sourceRecordId };
      })
      .filter(isDefined);

    if (eventsWithJunctionRecord.length === 0) {
      return [];
    }

    const sourceRecordsByRecordId =
      await this.timelineActivityTargetQueryService.findSourceRecordsByRecordId(
        {
          rule,
          recordIds: eventsWithJunctionRecord.map(
            ({ sourceRecordId }) => sourceRecordId,
          ),
          workspaceId,
        },
      );

    return eventsWithJunctionRecord
      .filter(({ sourceRecordId }) =>
        sourceRecordsByRecordId.has(sourceRecordId),
      )
      .map(({ event, target, sourceRecordId }) =>
        buildLinkedPayload({
          rule,
          name: `linked-${rule.sourceFlatObjectMetadata.nameSingular}.${action}`,
          timelineActivityTypeId,
          target,
          workspaceMemberId: event.workspaceMemberId,
          linkedRecordId: sourceRecordId,
          linkedRecordCachedName: resolveLinkedRecordCachedName({
            rule,
            record: sourceRecordsByRecordId.get(sourceRecordId),
            flatFieldMetadataMaps,
          }),
          properties: {},
        }),
      );
  }

  private async enrichEventsWithWorkspaceMemberId({
    events,
    workspaceId,
  }: {
    events: ObjectRecordBaseEvent[];
    workspaceId: string;
  }): Promise<ObjectRecordBaseEvent[]> {
    const userIds = events.map((event) => event.userId).filter(isDefined);

    if (userIds.length === 0) {
      return events;
    }

    const workspaceMemberRepository =
      await this.globalWorkspaceOrmManager.getRepository(
        workspaceId,
        WorkspaceMemberWorkspaceEntity,
        {
          shouldBypassPermissionChecks: true,
        },
      );

    const workspaceMembers = await workspaceMemberRepository.findBy({
      userId: In(userIds),
    });

    return events.map((event) => {
      const workspaceMember = workspaceMembers.find(
        (member) => member.userId === event.userId,
      );

      return isDefined(event.userId) && isDefined(workspaceMember)
        ? { ...event, workspaceMemberId: workspaceMember.id }
        : event;
    });
  }

  // Position changes reach other consumers (SSE, webhooks, workflows) but render
  // blank in the timeline, so exclude them to avoid empty activity rows.
  private excludePositionFieldsFromEventsDiff({
    events,
    objectMetadata,
    flatFieldMetadataMaps,
  }: {
    events: ObjectRecordBaseEvent[];
    objectMetadata: FlatObjectMetadata;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  }): ObjectRecordBaseEvent[] {
    const someEventHasDiff = events.some((event) =>
      isDefined(event.properties.diff),
    );

    if (!someEventHasDiff) {
      return events;
    }

    const positionFieldNames = new Set(
      getFlatFieldsFromFlatObjectMetadata(objectMetadata, flatFieldMetadataMaps)
        .filter((field) => field.type === FieldMetadataType.POSITION)
        .map((field) => field.name),
    );

    if (positionFieldNames.size === 0) {
      return events;
    }

    return events.map((event) => {
      const diff = event.properties.diff;

      if (!isDefined(diff)) {
        return event;
      }

      const diffWithoutPositionFields = Object.fromEntries(
        Object.entries(diff).filter(
          ([fieldName]) => !positionFieldNames.has(fieldName),
        ),
      );

      return {
        ...event,
        properties: { ...event.properties, diff: diffWithoutPositionFields },
      };
    });
  }
}
