import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ScopedWorkspaceContextFactory } from 'src/engine/twenty-orm/factories/scoped-workspace-context.factory';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { CreateOrUpdateRecordWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/record-crud/create-or-update-record.workflow-action';

describe('CreateOrUpdateRecordWorkflowAction', () => {
  let service: CreateOrUpdateRecordWorkflowAction;
  let objectMetadataRepository: Repository<ObjectMetadataEntity>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CreateOrUpdateRecordWorkflowAction,
        {
          provide: TwentyORMGlobalManager,
          useValue: {
            getRepositoryForWorkspace: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ObjectMetadataEntity),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: ScopedWorkspaceContextFactory,
          useValue: {
            create: jest.fn().mockReturnValue({ workspaceId: 'test-workspace-id' }),
          },
        },
        {
          provide: WorkflowCommonWorkspaceService,
          useValue: {
            getObjectMetadataItemWithFieldsMaps: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CreateOrUpdateRecordWorkflowAction>(
      CreateOrUpdateRecordWorkflowAction,
    );
    objectMetadataRepository = module.get<Repository<ObjectMetadataEntity>>(
      getRepositoryToken(ObjectMetadataEntity),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have the correct action type', () => {
    expect(service).toBeInstanceOf(CreateOrUpdateRecordWorkflowAction);
  });
});
