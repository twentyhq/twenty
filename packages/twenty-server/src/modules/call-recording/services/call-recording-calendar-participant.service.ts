import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import { type CallRecordingWorkspaceEntity } from 'src/modules/call-recording/standard-objects/call-recording.workspace-entity';
import { buildCallRecordingCalendarParticipant } from 'src/modules/call-recording/utils/build-call-recording-calendar-participant.util';

@Injectable()
export class CallRecordingCalendarParticipantService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    @InjectWorkspaceScopedRepository(ApplicationEntity)
    private readonly applicationRepository: WorkspaceScopedRepository<ApplicationEntity>,
  ) {}

  async syncParticipants({
    workspaceId,
    callRecordingIds,
  }: {
    workspaceId: string;
    callRecordingIds: string[];
  }): Promise<void> {
    const uniqueCallRecordingIds = [...new Set(callRecordingIds)].sort();

    if (uniqueCallRecordingIds.length === 0) {
      return;
    }

    await this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        this.workspaceOrmManager.runInWorkspaceTransaction(
          async (transactionScope) => {
            await transactionScope.executeRawQuery(
              `SELECT pg_advisory_xact_lock(hashtextextended("lockName", 0))
             FROM unnest($1::text[]) WITH ORDINALITY AS "locks"("lockName", "ordinality")
             ORDER BY "ordinality"`,
              [
                uniqueCallRecordingIds.map(
                  (id) => `${workspaceId}:call-recording-participant:${id}`,
                ),
              ],
            );

            const callRecordingRepository =
              transactionScope.getRepository<CallRecordingWorkspaceEntity>(
                'callRecording',
                { shouldBypassPermissionChecks: true },
              );
            const participantRepository =
              transactionScope.getRepository<CalendarEventParticipantWorkspaceEntity>(
                'calendarEventParticipant',
                { shouldBypassPermissionChecks: true },
              );
            const callRecordings = await callRecordingRepository.find({
              where: { id: In(uniqueCallRecordingIds) },
            });
            const applicationIds = [
              ...new Set(
                callRecordings
                  .map(({ applicationId }) => applicationId)
                  .filter(isDefined),
              ),
            ];
            const applications =
              applicationIds.length === 0
                ? []
                : await this.applicationRepository.find(workspaceId, {
                    where: { id: In(applicationIds) },
                    select: { id: true, name: true },
                    withDeleted: true,
                  });
            const applicationNamesById = new Map(
              applications.map(({ id, name }) => [id, name]),
            );
            const participants = callRecordings.flatMap((callRecording) => {
              const applicationName = isDefined(callRecording.applicationId)
                ? applicationNamesById.get(callRecording.applicationId)
                : undefined;
              const participant = isDefined(applicationName)
                ? buildCallRecordingCalendarParticipant(
                    callRecording,
                    applicationName,
                  )
                : undefined;

              return isDefined(participant) ? [participant] : [];
            });
            const participantCallRecordingIds = new Set(
              participants.map(({ callRecordingId }) => callRecordingId),
            );
            const callRecordingIdsToRemove = uniqueCallRecordingIds.filter(
              (id) => !participantCallRecordingIds.has(id),
            );

            if (callRecordingIdsToRemove.length > 0) {
              await participantRepository.delete({
                callRecordingId: In(callRecordingIdsToRemove),
              });
            }

            if (participants.length > 0) {
              await participantRepository.upsert(participants, [
                'callRecordingId',
              ]);
            }
          },
        ),
      buildSystemAuthContext(workspaceId),
    );
  }
}
