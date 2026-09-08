import { Injectable, Logger } from '@nestjs/common';

import { randomUUID } from 'crypto';

import { isDefined } from 'twenty-shared/utils';
import { In, Not } from 'typeorm';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  CLOSED_OPPORTUNITY_STAGES,
  SYSTEM_ACTOR,
} from 'src/modules/enso/lead-pipeline/lead-pipeline.constants';
import {
  CALLBACK_OWED_CALL_STATUSES,
  MISSED_CALL_CALLBACK_STEP_KEY,
} from 'src/modules/enso/telephony/telephony.constants';

type OpportunityRow = {
  id: string;
  name?: string | null;
  stage?: string | null;
  ownerId?: string | null;
  pointOfContactId?: string | null;
  firstContactAt?: Date | string | null;
  firstContactChannel?: string | null;
};

type InboundActivityRow = {
  id: string;
  opportunityId?: string | null;
  kind?: string | null;
  callStatus?: string | null;
  callerE164?: string | null;
  occurredAt?: Date | string | null;
};

type ActorValue = { source: string; name: string; context?: object };

type TaskRow = {
  id: string;
  position: number;
  createdBy?: ActorValue | null;
  updatedBy?: ActorValue | null;
  title?: string | null;
  status?: string | null;
  stepKey?: string | null;
  channel?: string | null;
  outcome?: string | null;
  assigneeId?: string | null;
  dueAt?: Date | string | null;
  isAutoCreated?: boolean | null;
  bodyV2?: { markdown: string; blocknote: string } | null;
};

type TaskTargetRow = {
  id?: string;
  createdBy?: ActorValue | null;
  updatedBy?: ActorValue | null;
  taskId: string;
  targetOpportunityId?: string | null;
  targetPersonId?: string | null;
};

// What happens around a call once the activity itself is recorded.
//
// The two halves of one loop. A call the responsible manager did not pick up
// leaves an obligation on that manager, not on the queue — so it becomes a
// callback task rather than a deal handed back to routing. And the callback,
// when it connects, is the real first contact, so that is what advances the deal
// to CONNECTED. Nothing here asserts contact that did not happen: a missed call
// creates work, an answered call creates a stage change.
//
// Every method is best-effort and idempotent. These run off the back of PBX
// pushes, which redeliver, and none of them is a reason to fail the ingest that
// actually records the call.
@Injectable()
export class CallFollowUpService {
  private readonly logger = new Logger(CallFollowUpService.name);

  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  // A call we owed an answer to and did not give. Puts it on the deal owner's
  // task list. Called from the pipeline at the two points where "this deal has
  // an owner" first becomes true — a sticky auto-claim, and an activity
  // attaching to an already-owned deal — so no polling and no delay guessing.
  // `activityId` names the call that triggered this, when the caller knows it.
  // Without it the deal's most recent call is used, which is only correct for a
  // freshly created deal — the call that opened it is by definition its latest.
  // On an ATTACH the deal may carry an old missed call that was already handled,
  // so passing the activity is what keeps today's form submission from
  // resurrecting last week's callback.
  async createMissedCallCallbackTask(
    workspaceId: string,
    opportunityId: string,
    activityId?: string,
  ): Promise<void> {
    const systemAuthContext = buildSystemAuthContext(workspaceId);

    try {
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const opportunityRepository =
            await this.globalWorkspaceOrmManager.getRepository<OpportunityRow>(
              workspaceId,
              'opportunity',
              { shouldBypassPermissionChecks: true },
            );

          const opportunity = await opportunityRepository.findOne({
            where: { id: opportunityId },
          });

          if (!isDefined(opportunity)) {
            return;
          }

          // No owner means the deal is parked with nobody responsible, which is
          // routing's problem to solve — a task assigned to no one is invisible.
          if (!isDefined(opportunity.ownerId)) {
            return;
          }

          if (
            isDefined(opportunity.stage) &&
            (CLOSED_OPPORTUNITY_STAGES as readonly string[]).includes(
              opportunity.stage,
            )
          ) {
            return;
          }

          const call = await this.findCall(
            workspaceId,
            opportunityId,
            activityId,
          );

          if (
            call?.kind !== 'INCOMING_CALL' ||
            !isDefined(call.callStatus) ||
            !CALLBACK_OWED_CALL_STATUSES.includes(call.callStatus)
          ) {
            return;
          }

          const taskRepository =
            await this.globalWorkspaceOrmManager.getRepository<TaskRow>(
              workspaceId,
              'task',
              { shouldBypassPermissionChecks: true },
            );

          const taskTargetRepository =
            await this.globalWorkspaceOrmManager.getRepository<TaskTargetRow>(
              workspaceId,
              'taskTarget',
              { shouldBypassPermissionChecks: true },
            );

          const outstanding = await this.findOpenCallbackTask(
            taskRepository,
            taskTargetRepository,
            opportunityId,
          );

          if (isDefined(outstanding)) {
            return;
          }

          const caller = call.callerE164 ?? 'an unknown number';
          const taskId = randomUUID();
          // Raw inserts bypass the create resolver, so the ordering position and
          // the actor columns have to be materialized here. Without the actor the
          // database default stamps the row 'System / MANUAL', which reads as a
          // person having typed the task out.
          const lastPosition = await taskRepository.maximum(
            'position',
            undefined,
          );

          await taskRepository.insert({
            id: taskId,
            position: (lastPosition ?? 0) + 1,
            createdBy: SYSTEM_ACTOR,
            updatedBy: SYSTEM_ACTOR,
            title: `Call back ${caller}`,
            status: 'TODO',
            channel: 'CALL',
            stepKey: MISSED_CALL_CALLBACK_STEP_KEY,
            isAutoCreated: true,
            assigneeId: opportunity.ownerId,
            // Due now: the caller is waiting, and a callback that lands tomorrow
            // is a different (worse) conversation than one that lands today.
            dueAt: new Date(),
            bodyV2: this.richText([
              `${caller} rang and nobody picked up${
                isDefined(call.occurredAt)
                  ? ` (${new Date(call.occurredAt).toISOString()})`
                  : ''
              }.`,
              'They are your client, so the call was not passed to the shared queue — it is yours to return.',
              'Log the result on this task, or just call back through the CRM and the deal moves itself to Connected.',
            ]),
          });

          // Join rows: the task belongs on the deal's Tasks tab, and on the
          // contact's, which is where a manager actually looks.
          await taskTargetRepository.insert({
            id: randomUUID(),
            taskId,
            targetOpportunityId: opportunityId,
            createdBy: SYSTEM_ACTOR,
            updatedBy: SYSTEM_ACTOR,
          });

          if (isDefined(opportunity.pointOfContactId)) {
            await taskTargetRepository.insert({
              id: randomUUID(),
              taskId,
              targetPersonId: opportunity.pointOfContactId,
              createdBy: SYSTEM_ACTOR,
              updatedBy: SYSTEM_ACTOR,
            });
          }

          this.logger.log(
            `Created callback task ${taskId} for missed call on opportunity ${opportunityId} (owner ${opportunity.ownerId})`,
          );
        },
        systemAuthContext,
      );
    } catch (error) {
      this.logger.warn(
        `Could not create callback task for opportunity ${opportunityId}: ${(error as Error).message}`,
      );
    }
  }

  // The other half: a manager's outbound call that was actually answered IS the
  // first human contact, whatever produced the lead. So it advances the deal out
  // of LEAD_CLAIMED and closes the callback task that asked for it.
  //
  // Only from LEAD_CLAIMED. A deal still in ROUTING has not been claimed by
  // anyone, and claiming it as a side effect of one outbound call would take it
  // away from the router without anybody deciding to.
  async connectFromAnsweredOutboundCall(
    workspaceId: string,
    opportunityId: string,
    outboundActivityId?: string,
  ): Promise<void> {
    const systemAuthContext = buildSystemAuthContext(workspaceId);

    try {
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () => {
          const opportunityRepository =
            await this.globalWorkspaceOrmManager.getRepository<OpportunityRow>(
              workspaceId,
              'opportunity',
              { shouldBypassPermissionChecks: true },
            );

          const opportunity = await opportunityRepository.findOne({
            where: { id: opportunityId },
          });

          if (!isDefined(opportunity) || opportunity.stage !== 'LEAD_CLAIMED') {
            return;
          }

          await opportunityRepository.update(
            { id: opportunityId },
            {
              stage: 'CONNECTED',
              // firstContactAt is frozen on the FIRST contact only; a later call
              // must not move it, or response-time reporting reads the newest
              // conversation instead of the one that mattered.
              ...(isDefined(opportunity.firstContactAt)
                ? {}
                : {
                    firstContactAt: new Date(),
                    firstContactChannel: 'CALL',
                  }),
            },
          );

          this.logger.log(
            `Opportunity ${opportunityId} advanced LEAD_CLAIMED → CONNECTED by an answered outbound call`,
          );

          const taskRepository =
            await this.globalWorkspaceOrmManager.getRepository<TaskRow>(
              workspaceId,
              'task',
              { shouldBypassPermissionChecks: true },
            );

          const taskTargetRepository =
            await this.globalWorkspaceOrmManager.getRepository<TaskTargetRow>(
              workspaceId,
              'taskTarget',
              { shouldBypassPermissionChecks: true },
            );

          const outstanding = await this.findOpenCallbackTask(
            taskRepository,
            taskTargetRepository,
            opportunityId,
          );

          if (!isDefined(outstanding)) {
            return;
          }

          await taskRepository.update(
            { id: outstanding.id },
            { status: 'DONE', outcome: 'REACHED', updatedBy: SYSTEM_ACTOR },
          );

          // Tie the call that closed it to the task, so the recording is one
          // click from the task rather than only findable on the timeline.
          if (isDefined(outboundActivityId)) {
            const outboundRepository =
              await this.globalWorkspaceOrmManager.getRepository<{
                id: string;
                taskId?: string | null;
              }>(workspaceId, 'outboundActivity', {
                shouldBypassPermissionChecks: true,
              });

            await outboundRepository.update(
              { id: outboundActivityId },
              { taskId: outstanding.id },
            );
          }

          this.logger.log(
            `Closed callback task ${outstanding.id} as REACHED on opportunity ${opportunityId}`,
          );
        },
        systemAuthContext,
      );
    } catch (error) {
      this.logger.warn(
        `Could not advance opportunity ${opportunityId} from an outbound call: ${(error as Error).message}`,
      );
    }
  }

  // The call this callback is owed for: the named activity when there is one,
  // otherwise the deal's most recent call.
  private async findCall(
    workspaceId: string,
    opportunityId: string,
    activityId?: string,
  ): Promise<InboundActivityRow | undefined> {
    const repository =
      await this.globalWorkspaceOrmManager.getRepository<InboundActivityRow>(
        workspaceId,
        'inboundActivity',
        { shouldBypassPermissionChecks: true },
      );

    if (isDefined(activityId)) {
      return (
        (await repository.findOne({ where: { id: activityId } })) ?? undefined
      );
    }

    const calls: InboundActivityRow[] = await repository.find({
      where: { opportunityId, kind: 'INCOMING_CALL' },
      order: { occurredAt: 'DESC' },
      take: 1,
    });

    return calls[0];
  }

  // An OPEN auto-created callback task on this deal, if there is one. The
  // taskTarget join is the only link between a task and a deal, so it takes two
  // queries.
  private async findOpenCallbackTask(
    taskRepository: { find: (options: object) => Promise<TaskRow[]> },
    taskTargetRepository: {
      find: (options: object) => Promise<TaskTargetRow[]>;
    },
    opportunityId: string,
  ): Promise<TaskRow | undefined> {
    const targets = await taskTargetRepository.find({
      where: { targetOpportunityId: opportunityId },
    });

    const taskIds = targets.map((target) => target.taskId).filter(isDefined);

    if (taskIds.length === 0) {
      return undefined;
    }

    const tasks = await taskRepository.find({
      where: {
        id: In(taskIds),
        stepKey: MISSED_CALL_CALLBACK_STEP_KEY,
        status: Not('DONE'),
      },
    });

    return tasks[0];
  }

  private richText(lines: string[]): { markdown: string; blocknote: string } {
    const blocks = lines.map((text, index) => ({
      id: `blk-${index}`,
      type: 'paragraph',
      props: {
        textColor: 'default',
        backgroundColor: 'default',
        textAlignment: 'left',
      },
      content: [{ type: 'text', text, styles: {} }],
      children: [],
    }));

    return { markdown: lines.join('\n\n'), blocknote: JSON.stringify(blocks) };
  }
}
