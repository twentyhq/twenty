import { Injectable } from '@nestjs/common';

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
import { TimelineActivityRoutingPlanService } from 'src/modules/timeline/services/timeline-activity-routing-plan.service';
import {
  type ResolvedTimelineActivityType,
  type TimelineActivityTypeResolver,
} from 'src/modules/timeline/utils/resolve-timeline-activity-type.util';
import { TimelineActivityTargetQueryService } from 'src/modules/timeline/services/timeline-activity-target-query.service';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { type ResolvedTimelineActivityTarget } from 'src/modules/timeline/types/resolved-timeline-activity-target.type';
import { type TimelineActivityPayload } from 'src/modules/timeline/types/timeline-activity-payload';
import { type TimelineActivityRuleAction } from 'src/modules/timeline/types/timeline-activity-rule-action.type';
import { type TimelineActivityRule } from 'src/modules/timeline/types/timeline-activity-rule.type';
import { resolveLinkedRecordCachedName } from 'src/modules/timeline/utils/resolve-linked-record-cached-name.util';
import { resolveTimelineActivityHappensAt } from 'src/modules/timeline/utils/resolve-timeline-activity-happens-at.util';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { TimelineActivityMetadataDiagnosticsService } from 'src/modules/timeline/services/timeline-activity-metadata-diagnostics.service';
import { doesTimelineActivityLinkChange } from 'src/modules/timeline/utils/does-timeline-activity-link-change.util';
import { resolveTimelineActivityRuleAction } from 'src/modules/timeline/utils/resolve-timeline-activity-rule-action.util';

type BuildPayloadsForRuleArgs = {
  rule: TimelineActivityRule;
  events: ObjectRecordBaseEvent[];
  action: DatabaseEventAction;
  workspaceId: string;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  resolveTimelineActivityType: TimelineActivityTypeResolver;
};

// Only the diff is worth storing: the rest of an event payload is the record
// itself, which the timeline reads live.
const keepDiffOnly = (
  properties: ObjectRecordBaseEvent['properties'],
): Pick<ObjectRecordBaseEvent['properties'], 'diff'> => {
  const { diff } = properties;

  return isDefined(diff) && Object.keys(diff).length > 0 ? { diff } : {};
};

const resolveEventRecordForRuleAction = ({
  event,
  eventAction,
  ruleAction,
}: {
  event: ObjectRecordBaseEvent;
  eventAction: DatabaseEventAction;
  ruleAction: TimelineActivityRuleAction;
}): ObjectRecord | undefined =>
  (eventAction === 'deleted' || ruleAction === 'unlinked'
    ? (event.properties.before ?? event.properties.after)
    : (event.properties.after ?? event.properties.before)) as
    | ObjectRecord
    | undefined;

const buildLinkedPayload = ({
  rule,
  timelineActivityType,
  target,
  workspaceMemberId,
  linkedRecordId,
  linkedRecordCachedName,
  happensAt,
  properties,
}: {
  rule: TimelineActivityRule;
  timelineActivityType: ResolvedTimelineActivityType;
  target: ResolvedTimelineActivityTarget;
  workspaceMemberId: string | undefined;
  linkedRecordId: string;
  linkedRecordCachedName: string | undefined;
  happensAt: Date;
  properties: ObjectRecordBaseEvent['properties'];
}): TimelineActivityPayload => ({
  happensAt,
  timelineActivityTypeId: timelineActivityType.id,
  timelineActivityTypeSnapshot: timelineActivityType.snapshot,
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
  constructor(
    @InjectObjectMetadataRepository(TimelineActivityWorkspaceEntity)
    private readonly timelineActivityRepository: TimelineActivityRepository,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly timelineActivityRoutingPlanService: TimelineActivityRoutingPlanService,
    private readonly timelineActivityTargetQueryService: TimelineActivityTargetQueryService,
    private readonly timelineActivityMetadataDiagnosticsService: TimelineActivityMetadataDiagnosticsService,
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
      resolveTimelineActivityType,
    } = await this.timelineActivityRoutingPlanService.getRulesForEventBatch({
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
                resolveTimelineActivityType,
              }),
            ),
            ...junctionRules.map((rule) =>
              this.buildPayloadsForJunctionRule({
                rule,
                events: enrichedEvents,
                action,
                workspaceId,
                flatFieldMetadataMaps,
                resolveTimelineActivityType,
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

  private resolveTimelineActivityTypeForRule({
    rule,
    ruleAction,
    workspaceId,
    resolveTimelineActivityType,
  }: {
    rule: TimelineActivityRule;
    ruleAction: TimelineActivityRuleAction;
    workspaceId: string;
    resolveTimelineActivityType: TimelineActivityTypeResolver;
  }): ResolvedTimelineActivityType | undefined {
    const timelineActivityType =
      rule.timelineActivityType ??
      resolveTimelineActivityType({
        action: ruleAction,
        objectUniversalIdentifier:
          rule.sourceFlatObjectMetadata.universalIdentifier,
      });

    if (!isDefined(timelineActivityType)) {
      this.timelineActivityMetadataDiagnosticsService.report({
        workspaceId,
        reason: 'missing-type',
        action: ruleAction,
        objectUniversalIdentifier:
          rule.sourceFlatObjectMetadata.universalIdentifier,
      });
    }

    return timelineActivityType;
  }

  private async buildPayloadsForSourceRule({
    rule,
    events,
    action,
    workspaceId,
    flatFieldMetadataMaps,
    resolveTimelineActivityType,
  }: BuildPayloadsForRuleArgs): Promise<TimelineActivityPayload[]> {
    const ruleAction = resolveTimelineActivityRuleAction({
      actions: rule.actions,
      targetShape: rule.targetShape,
      eventAction: action,
      eventSource: 'SOURCE',
    });

    if (!isDefined(ruleAction)) {
      return [];
    }

    const timelineActivityType = this.resolveTimelineActivityTypeForRule({
      rule,
      ruleAction,
      workspaceId,
      resolveTimelineActivityType,
    });

    if (!isDefined(timelineActivityType)) {
      return [];
    }

    const matchingEvents = events
      .filter(
        (event) =>
          rule.targetShape.kind !== 'DIRECT_RELATION' ||
          action !== 'updated' ||
          ruleAction === 'updated' ||
          doesTimelineActivityLinkChange({
            event,
            joinColumnNames: rule.targetShape.targetJoinColumns.map(
              ({ joinColumnName }) => joinColumnName,
            ),
          }),
      )
      .filter((event) => this.ruleMatchesEvent({ rule, ruleAction, event }));

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
            timelineActivityTypeId: timelineActivityType.id,
            timelineActivityTypeSnapshot: timelineActivityType.snapshot,
            happensAt: resolveTimelineActivityHappensAt(event),
            objectSingularName: nameSingular,
            recordId: event.recordId,
            workspaceMemberId: event.workspaceMemberId,
            properties,
          },
        ];
      });
    }

    if (rule.targetShape.kind === 'DIRECT_RELATION') {
      return matchingEvents.flatMap((event) => {
        const record = resolveEventRecordForRuleAction({
          event,
          eventAction: action,
          ruleAction,
        });
        const target =
          this.timelineActivityTargetQueryService.resolveTargetFromRecord({
            rule,
            record,
          });

        if (!isDefined(target)) {
          return [];
        }

        return [
          buildLinkedPayload({
            rule,
            timelineActivityType,
            target,
            workspaceMemberId: event.workspaceMemberId,
            linkedRecordId: event.recordId,
            linkedRecordCachedName: resolveLinkedRecordCachedName({
              rule,
              record,
              flatFieldMetadataMaps,
            }),
            happensAt: resolveTimelineActivityHappensAt(event),
            properties: event.properties,
          }),
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
          timelineActivityType,
          target,
          workspaceMemberId: event.workspaceMemberId,
          linkedRecordId: event.recordId,
          linkedRecordCachedName: resolveLinkedRecordCachedName({
            rule,
            record: event.properties.after as ObjectRecord | undefined,
            flatFieldMetadataMaps,
          }),
          happensAt: resolveTimelineActivityHappensAt(event),
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
    resolveTimelineActivityType,
  }: BuildPayloadsForRuleArgs): Promise<TimelineActivityPayload[]> {
    const ruleAction = resolveTimelineActivityRuleAction({
      actions: rule.actions,
      targetShape: rule.targetShape,
      eventAction: action,
      eventSource: 'JUNCTION',
    });

    if (!isDefined(ruleAction) || rule.targetShape.kind !== 'JUNCTION') {
      return [];
    }

    const timelineActivityType = this.resolveTimelineActivityTypeForRule({
      rule,
      ruleAction,
      workspaceId,
      resolveTimelineActivityType,
    });

    if (!isDefined(timelineActivityType)) {
      return [];
    }

    const targetShape = rule.targetShape;
    const { junctionSourceJoinColumnName } = targetShape;

    const eventsWithJunctionRecord = events
      .filter(
        (event) =>
          action !== 'updated' ||
          doesTimelineActivityLinkChange({
            event,
            joinColumnNames: [
              targetShape.junctionSourceJoinColumnName,
              ...targetShape.targetJoinColumns.map(
                ({ joinColumnName }) => joinColumnName,
              ),
            ],
          }),
      )
      .filter((event) => this.ruleMatchesEvent({ rule, ruleAction, event }))
      .map((event) => {
        const junctionRecord = resolveEventRecordForRuleAction({
          event,
          eventAction: action,
          ruleAction,
        });

        const target =
          this.timelineActivityTargetQueryService.resolveTargetFromRecord({
            rule,
            record: junctionRecord,
          });

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

    // The junction event is the semantic fact; this enrichment read can race
    // the transaction that created the linked record.
    return eventsWithJunctionRecord.map(({ event, target, sourceRecordId }) =>
      buildLinkedPayload({
        rule,
        timelineActivityType,
        target,
        workspaceMemberId: event.workspaceMemberId,
        linkedRecordId: sourceRecordId,
        linkedRecordCachedName: resolveLinkedRecordCachedName({
          rule,
          record: sourceRecordsByRecordId.get(sourceRecordId),
          flatFieldMetadataMaps,
        }),
        happensAt: resolveTimelineActivityHappensAt(event),
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
