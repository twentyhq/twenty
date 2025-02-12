import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import request from 'supertest';
import { Repository } from 'typeorm';

import { BillingSubscriptionService } from 'src/engine/core-modules/billing/services/billing-subscription.service';
import { BillingService } from 'src/engine/core-modules/billing/services/billing.service';
import { DomainManagerService } from 'src/engine/core-modules/domain-manager/services/domain-manager.service';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { UserWorkspace } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserWorkspaceService } from 'src/engine/core-modules/user-workspace/user-workspace.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceResolver } from 'src/engine/core-modules/workspace/workspace.resolver';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { WorkspaceManagerService } from 'src/engine/workspace-manager/workspace-manager.service';

const client = request(`http://localhost:${APP_PORT}`);

describe('WorkspaceResolver', () => {
  let service: WorkspaceService;
  let workspaceRepository: Repository<Workspace>;
  let featureFlagService: FeatureFlagService;
  let permissionsService: PermissionsService;

  const mockWorkspace = {
    id: '1',
    displayName: 'Test Workspace',
    subdomain: 'test',
    customDomain: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceResolver,
        {
          provide: getRepositoryToken(Workspace, 'core'),
          useValue: {
            findOneBy: jest.fn().mockResolvedValue(mockWorkspace),
            save: jest.fn().mockResolvedValue(mockWorkspace),
          },
        },
        {
          provide: getRepositoryToken(User, 'core'),
          useValue: {},
        },
        {
          provide: getRepositoryToken(UserWorkspace, 'core'),
          useValue: {},
        },
        {
          provide: FeatureFlagService,
          useValue: {
            isFeatureEnabled: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: WorkspaceManagerService,
          useValue: {},
        },
        {
          provide: BillingService,
          useValue: {
            hasEntitlement: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: BillingSubscriptionService,
          useValue: {},
        },
        {
          provide: UserWorkspaceService,
          useValue: {},
        },
        {
          provide: EnvironmentService,
          useValue: {
            get: jest.fn().mockReturnValue('default'),
          },
        },
        {
          provide: DomainManagerService,
          useValue: {
            updateCustomDomain: jest.fn(),
            registerCustomDomain: jest.fn(),
            deleteCustomHostnameByHostnameSilently: jest.fn(),
          },
        },
        {
          provide: ExceptionHandlerService,
          useValue: {
            captureExceptions: jest.fn(),
          },
        },
        {
          provide: PermissionsService,
          useValue: {
            userHasWorkspaceSettingPermission: jest
              .fn()
              .mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    service = module.get<WorkspaceService>(WorkspaceService);
    workspaceRepository = module.get<Repository<Workspace>>(
      getRepositoryToken(Workspace, 'core'),
    );
    featureFlagService = module.get<FeatureFlagService>(FeatureFlagService);
    permissionsService = module.get<PermissionsService>(PermissionsService);
  });

  describe('updateWorkspaceById', () => {
    // it('should update workspace when permissions are enabled and user has permission', async () => {
    //   const updatePayload = {
    //     id: '1',
    //     displayName: 'Updated Workspace',
    //   };

    //   // Mock feature flag to be enabled
    //   jest
    //     .spyOn(featureFlagService, 'isFeatureEnabled')
    //     .mockResolvedValue(true);

    //   // Mock permissions check
    //   jest
    //     .spyOn(permissionsService, 'userHasWorkspaceSettingPermission')
    //     .mockResolvedValue(true);

    //   const result = await service.updateWorkspaceById({
    //     payload: updatePayload,
    //     userWorkspaceId: 'user-workspace-1',
    //   });

    //   expect(result).toBeDefined();
    //   expect(featureFlagService.isFeatureEnabled).toHaveBeenCalledWith(
    //     FeatureFlagKey.IsPermissionsEnabled,
    //     '1',
    //   );
    //   expect(
    //     permissionsService.userHasWorkspaceSettingPermission,
    //   ).toHaveBeenCalled();
    // });

    // it('should throw PermissionsException when user lacks permission', async () => {
    //   const updatePayload = {
    //     id: '1',
    //     displayName: 'Updated Workspace',
    //   };

    //   jest
    //     .spyOn(featureFlagService, 'isFeatureEnabled')
    //     .mockResolvedValue(true);

    //   jest
    //     .spyOn(permissionsService, 'userHasWorkspaceSettingPermission')
    //     .mockResolvedValue(false);

    //   await expect(
    //     service.updateWorkspaceById({
    //       payload: updatePayload,
    //       userWorkspaceId: 'user-workspace-1',
    //     }),
    //   ).rejects.toThrow();
    // });

    it('should update workspace when permissions are enabled and user has permission - integration', async () => {
      jest
        .spyOn(featureFlagService, 'isFeatureEnabled')
        .mockResolvedValue(true);

      // Mock permissions check
      jest
        .spyOn(permissionsService, 'userHasWorkspaceSettingPermission')
        .mockResolvedValue(true);

      const queryData = {
        query: `
        mutation updateWorkspace {
          updateWorkspace(data: { displayName: "New Workspace Name" }) {
            id
            displayName
          }
        }
      `,
      };

      return client
        .post('/graphql')
        .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
        .send(queryData)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          expect(res.body.errors).toBeUndefined();
        })
        .expect((res) => {
          const data = res.body.data.updateWorkspace;

          expect(data).toBeDefined();
          expect(data.displayName).toBe('New Workspace Name');
        });
    });
  });
});
