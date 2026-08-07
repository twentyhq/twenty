import { Test, type TestingModule } from '@nestjs/testing';

import { Not } from 'typeorm';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { NotificationEmitterService } from 'src/modules/notification/services/notification-emitter.service';

describe('NotificationEmitterService', () => {
  let service: NotificationEmitterService;
  let notificationRepository: {
    findOne: jest.Mock;
    insert: jest.Mock;
    update: jest.Mock;
  };

  const workspaceId = 'workspace-1';
  const workspaceMemberId = 'workspace-member-1';

  beforeEach(async () => {
    notificationRepository = {
      findOne: jest.fn().mockResolvedValue(null),
      insert: jest.fn().mockResolvedValue(undefined),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationEmitterService,
        {
          provide: GlobalWorkspaceOrmManager,
          useValue: {
            getRepository: jest.fn().mockResolvedValue(notificationRepository),
            executeInWorkspaceContext: jest.fn(
              (callback: () => Promise<unknown>) => callback(),
            ),
          },
        },
      ],
    }).compile();

    service = module.get(NotificationEmitterService);
    jest.spyOn(service['logger'], 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should insert an UNREAD notification for each workspace member', async () => {
    await service.emitToWorkspaceMembers({
      workspaceId,
      workspaceMemberIds: [workspaceMemberId, 'workspace-member-2'],
      type: 'workflow_run_failed',
      title: 'My workflow run failed',
      preview: 'Some error',
      requiresAction: true,
      subjectRecordId: 'workflow-run-1',
      payload: { workflowRunId: 'workflow-run-1' },
    });

    expect(notificationRepository.insert).toHaveBeenCalledTimes(2);
    expect(notificationRepository.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'workflow_run_failed',
        title: 'My workflow run failed',
        preview: 'Some error',
        payload: { workflowRunId: 'workflow-run-1' },
        requiresAction: true,
        status: 'UNREAD',
        dedupeKey: null,
        threadId: null,
        subjectRecordId: 'workflow-run-1',
        workspaceMemberId,
      }),
    );
    expect(notificationRepository.update).not.toHaveBeenCalled();
  });

  it('should update the existing non-DONE notification back to UNREAD when the dedupe key matches', async () => {
    notificationRepository.findOne.mockResolvedValue({
      id: 'notification-1',
      status: 'READ',
    });

    await service.emitToWorkspaceMembers({
      workspaceId,
      workspaceMemberIds: [workspaceMemberId],
      type: 'workflow_run_failed',
      title: 'Updated title',
      preview: 'Updated preview',
      payload: { workflowRunId: 'workflow-run-1' },
      dedupeKey: 'workflow_run_failed:workflow-run-1',
    });

    expect(notificationRepository.findOne).toHaveBeenCalledWith({
      where: {
        dedupeKey: 'workflow_run_failed:workflow-run-1',
        workspaceMemberId,
        status: Not('DONE'),
      },
    });
    expect(notificationRepository.update).toHaveBeenCalledWith(
      'notification-1',
      {
        title: 'Updated title',
        preview: 'Updated preview',
        payload: { workflowRunId: 'workflow-run-1' },
        status: 'UNREAD',
      },
    );
    expect(notificationRepository.insert).not.toHaveBeenCalled();
  });

  it('should insert when the dedupe key matches no existing notification', async () => {
    notificationRepository.findOne.mockResolvedValue(null);

    await service.emitToWorkspaceMembers({
      workspaceId,
      workspaceMemberIds: [workspaceMemberId],
      type: 'workflow_run_failed',
      title: 'My workflow run failed',
      dedupeKey: 'workflow_run_failed:workflow-run-1',
    });

    expect(notificationRepository.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        dedupeKey: 'workflow_run_failed:workflow-run-1',
        status: 'UNREAD',
      }),
    );
    expect(notificationRepository.update).not.toHaveBeenCalled();
  });

  it('should swallow per-member errors and keep emitting to the remaining members', async () => {
    notificationRepository.insert
      .mockRejectedValueOnce(new Error('insert failed'))
      .mockResolvedValueOnce(undefined);

    await expect(
      service.emitToWorkspaceMembers({
        workspaceId,
        workspaceMemberIds: [workspaceMemberId, 'workspace-member-2'],
        type: 'workflow_run_failed',
        title: 'My workflow run failed',
      }),
    ).resolves.toBeUndefined();

    expect(notificationRepository.insert).toHaveBeenCalledTimes(2);
    expect(service['logger'].warn).toHaveBeenCalledTimes(1);
  });

  it('should swallow repository acquisition errors', async () => {
    const globalWorkspaceOrmManager = service['globalWorkspaceOrmManager'];

    jest
      .spyOn(globalWorkspaceOrmManager, 'getRepository')
      .mockRejectedValue(new Error('cache recompute failed'));

    await expect(
      service.emitToWorkspaceMembers({
        workspaceId,
        workspaceMemberIds: [workspaceMemberId],
        type: 'workflow_run_failed',
        title: 'My workflow run failed',
      }),
    ).resolves.toBeUndefined();

    expect(service['logger'].warn).toHaveBeenCalledTimes(1);
  });

  it('should do nothing when there are no workspace members', async () => {
    const globalWorkspaceOrmManager = service['globalWorkspaceOrmManager'];

    await service.emitToWorkspaceMembers({
      workspaceId,
      workspaceMemberIds: [],
      type: 'workflow_run_failed',
      title: 'My workflow run failed',
    });

    expect(
      globalWorkspaceOrmManager.executeInWorkspaceContext,
    ).not.toHaveBeenCalled();
  });
});
