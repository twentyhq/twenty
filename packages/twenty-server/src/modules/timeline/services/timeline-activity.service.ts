import { Injectable } from '@nestjs/common';

import { type ObjectRecordBaseEvent } from 'twenty-shared/database-events';
import { type TimelineActivityAction } from 'twenty-shared/timeline';
import { FieldMetadataType, type ObjectRecord } from 'twenty-shared/types';
import { isNonEmptyString } from '@sniptt/guards';
import { fromArrayToValuesByKeyRecord, isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { parseEventNameOrThrow } from 'src/engine/workspace-event-emitter/utils/parse-event-name';
import { TimelineActivityRepository } from 'src/modules/timeline/repositories/timeline-activity.repository';
import { TimelineActivityRuleResolverService } from 'src/modules/timeline/services/timeline-activity-rule-resolver.service';
import {
  resolveLinkedRecordCachedName,
  type ResolvedTimelineActivityTarget,
  TimelineActivityTargetResolverService,
} from 'src/modules/timeline/services/timeline-activity-target-resolver.service';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { type TimelineActivityPayload } from 'src/modules/timeline/types/timeline-activity-payload';
import { type TimelineActivityRule } from 'src/modules/timeline/types/timeline-activity-rule.type';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

// An event on the junction object is a change to the link, not to the linked
// record. `updated` covers a junction row being repointed at another target.
const JUNCTION_EVENT_ACTIONS: Partial<
  Record<DatabaseEventAction, TimelineActivityAction>
> = {
  created: 'linked',
  restored: 'linked',
  updated: 'linked',
  deleted: 'unlinked',
};

const SOURCE_EVENT_ACTIONS: Partial<
  Record<DatabaseEventAction, TimelineActivityAction>
> = {
  created: 'created',
  updated: 'updated',
  deleted: 'deleted',
  restored: 'restored',
};

// Both event streams write the same row shape; only the linked record, its
// cached name and the persisted properties differ.
const buildLinkedPayload = ({
  rule,
  action,
  ruleAction,
  target,
  workspaceMemberId,
  linkedRecordId,
  linkedRecordCachedName,
  properties,
}: {
  rule: TimelineActivityRule;
  action: DatabaseEventAction;
  ruleAction: TimelineActivityAction;
  target: ResolvedTimelineActivityTarget;
  workspaceMemberId: string | undefined;
  linkedRecordId: string;
  linkedRecordCachedName: string | undefined;
  properties: ObjectRecordBaseEvent['properties'];
}): TimelineActivityPayload => ({
  name: `linked-${rule.sourceFlatObjectMetadata.nameSingular}.${action}`,
  action: ruleAction,
  sourceObjectMetadataId: rule.sourceFlatObjectMetadata.id,
  objectSingularName: target.targetObjectNameSingular,
  recordId: target.targetRecordId,
  workspaceMemberId,
  linkedRecordId,
  linkedObjectMetadataId: rule.sourceFlatObjectMetadata.id,
  linkedRecordCachedName,
  properties,
});

@Injectable()
export class TimelineActivityService {
  constructor(
    @InjectObjectMetadataRepository(TimelineActivityWorkspaceEntity)
    private readonly timelineActivityRepository: TimelineActivityRepository,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly timelineActivityRuleResolverService: TimelineActivityRuleResolverService,
    private readonly timelineActivityTargetResolverService: TimelineActivityTargetResolverService,
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

    const { sourceRules, junctionRules, flatFieldMetadataMaps } =
      await this.timelineActivityRuleResolverService.getRulesForEventBatch({
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
              rule.targetShape.kind === 'MANY_TO_ONE'
                ? Promise.resolve(
                    this.buildPayloadsForManyToOneRule({
                      rule,
                      events: enrichedEvents,
                      action,
                      flatFieldMetadataMaps,
                    }),
                  )
                : this.buildPayloadsForSourceRule({
                    rule,
                    events: enrichedEvents,
                    action,
                    workspaceId,
                    flatFieldMetadataMaps,
                  }),
            ),
            ...junctionRules.map((rule) =>
              this.buildPayloadsForJunctionRule({
                rule,
                events: enrichedEvents,
                action,
                workspaceId,
                flatFieldMetadataMaps,
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
    ruleAction: TimelineActivityAction;
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
  }: {
    rule: TimelineActivityRule;
    events: ObjectRecordBaseEvent[];
    action: DatabaseEventAction;
    workspaceId: string;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  }): Promise<TimelineActivityPayload[]> {
    const ruleAction = SOURCE_EVENT_ACTIONS[action];

    if (!isDefined(ruleAction)) {
      return [];
    }

    const matchingEvents = events.filter((event) =>
      this.ruleMatchesEvent({ rule, ruleAction, event }),
    );

    if (matchingEvents.length === 0) {
      return [];
    }

    const { nameSingular, id: sourceObjectMetadataId } =
      rule.sourceFlatObjectMetadata;

    if (rule.targetShape.kind === 'SELF') {
      return matchingEvents.map((event) => ({
        name: `${nameSingular}.${action}`,
        action: ruleAction,
        sourceObjectMetadataId,
        objectSingularName: nameSingular,
        recordId: event.recordId,
        workspaceMemberId: event.workspaceMemberId,
        properties: event.properties,
      }));
    }

    const targetsBySourceRecordId =
      await this.timelineActivityTargetResolverService.resolveTargetsBySourceRecordId(
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
          action,
          ruleAction,
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

  // A many-to-one rule reads its targets straight from the event: the join
  // column on the source record points at the timeline receiving the entry.
  // A lookup change unlinks the old target and links the new one; other source
  // updates write an `updated` entry on the current target, trigger gated.
  private buildPayloadsForManyToOneRule({
    rule,
    events,
    action,
    flatFieldMetadataMaps,
  }: {
    rule: TimelineActivityRule;
    events: ObjectRecordBaseEvent[];
    action: DatabaseEventAction;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  }): TimelineActivityPayload[] {
    if (rule.targetShape.kind !== 'MANY_TO_ONE') {
      return [];
    }

    const { relationFieldName, targetJoinColumn } = rule.targetShape;
    const { joinColumnName, targetObjectNameSingular } = targetJoinColumn;

    return events.flatMap((event) => {
      const after = event.properties.after as ObjectRecord | undefined;
      const before = event.properties.before as ObjectRecord | undefined;

      const buildPayload = (
        targetRecordId: string,
        ruleAction: TimelineActivityAction,
      ): TimelineActivityPayload =>
        buildLinkedPayload({
          rule,
          action,
          ruleAction,
          target: { targetObjectNameSingular, targetRecordId },
          workspaceMemberId: event.workspaceMemberId,
          linkedRecordId: event.recordId,
          linkedRecordCachedName: resolveLinkedRecordCachedName({
            rule,
            record: after ?? before,
            flatFieldMetadataMaps,
          }),
          properties: ruleAction === 'updated' ? event.properties : {},
        });

      switch (action) {
        case DatabaseEventAction.CREATED:
        case DatabaseEventAction.RESTORED: {
          const targetRecordId = after?.[joinColumnName];

          return rule.actions.includes('linked') &&
            isNonEmptyString(targetRecordId)
            ? [buildPayload(targetRecordId, 'linked')]
            : [];
        }
        case DatabaseEventAction.DELETED: {
          const targetRecordId =
            after?.[joinColumnName] ?? before?.[joinColumnName];

          return rule.actions.includes('unlinked') &&
            isNonEmptyString(targetRecordId)
            ? [buildPayload(targetRecordId, 'unlinked')]
            : [];
        }
        case DatabaseEventAction.UPDATED: {
          const relationDiff = (
            event.properties.diff as
              | Record<
                  string,
                  {
                    before?: { id?: string | null };
                    after?: { id?: string | null };
                  }
                >
              | undefined
          )?.[relationFieldName];

          if (isDefined(relationDiff)) {
            const previousTargetRecordId = relationDiff.before?.id;
            const nextTargetRecordId = relationDiff.after?.id;

            return [
              ...(rule.actions.includes('unlinked') &&
              isNonEmptyString(previousTargetRecordId)
                ? [buildPayload(previousTargetRecordId, 'unlinked')]
                : []),
              ...(rule.actions.includes('linked') &&
              isNonEmptyString(nextTargetRecordId)
                ? [buildPayload(nextTargetRecordId, 'linked')]
                : []),
            ];
          }

          const targetRecordId = after?.[joinColumnName];

          return this.ruleMatchesEvent({
            rule,
            ruleAction: 'updated',
            event,
          }) && isNonEmptyString(targetRecordId)
            ? [buildPayload(targetRecordId, 'updated')]
            : [];
        }
        default:
          return [];
      }
    });
  }

  private async buildPayloadsForJunctionRule({
    rule,
    events,
    action,
    workspaceId,
    flatFieldMetadataMaps,
  }: {
    rule: TimelineActivityRule;
    events: ObjectRecordBaseEvent[];
    action: DatabaseEventAction;
    workspaceId: string;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  }): Promise<TimelineActivityPayload[]> {
    const ruleAction = JUNCTION_EVENT_ACTIONS[action];

    if (!isDefined(ruleAction) || rule.targetShape.kind !== 'JUNCTION') {
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
          this.timelineActivityTargetResolverService.resolveTargetFromJunctionRecord(
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
      await this.timelineActivityTargetResolverService.findSourceRecordsByRecordId(
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
          action,
          ruleAction,
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

  // Position changes reach other consumers (SSE, webhooks, workflows) but render
  // blank in the timeline, so exclude them to avoid empty activity rows.
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
