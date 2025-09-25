import { Test, type TestingModule } from '@nestjs/testing';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { FieldActorSource } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { CreateCompanyAndContactService } from 'src/modules/contact-creation-manager/services/create-company-and-contact.service';
import { CreateCompanyService } from 'src/modules/contact-creation-manager/services/create-company.service';
import { CreateContactService } from 'src/modules/contact-creation-manager/services/create-person.service';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

describe('CreateCompanyAndContactService', () => {
  let service: CreateCompanyAndContactService;
  let createCompaniesService: CreateCompanyService;
  let createContactService: CreateContactService;

  const workspaceId = 'workspace-1';

  const mockConnectedAccount = {} as ConnectedAccountWorkspaceEntity;

  beforeEach(async () => {
    const mockCreateCompaniesService = {
      createOrRestoreCompanies: jest.fn(),
    };
    const mockCreateContactService = {
      restorePeople: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCompanyAndContactService,
        {
          provide: CreateCompanyService,
          useValue: mockCreateCompaniesService,
        },
        {
          provide: CreateContactService,
          useValue: mockCreateContactService,
        },
        {
          provide: TwentyORMGlobalManager,
          useValue: {},
        },
        {
          provide: ExceptionHandlerService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<CreateCompanyAndContactService>(
      CreateCompanyAndContactService,
    );
    createContactService =
      module.get<CreateContactService>(CreateContactService);
    createCompaniesService =
      module.get<CreateCompanyService>(CreateCompanyService);
  });

  describe('restorePeopleAndRestoreOrCreateCompanies - method', () => {
    it('should restore the soft deleted contact - matching primary email', async () => {
      await service.restorePeopleAndRestoreOrCreateCompanies(
        [
          {
            id: 'contact-1',
            emails: {
              primaryEmail: 'soft-deleted-contact@example.com',
              additionalEmails: [],
            },
            deletedAt: new Date(),
          } as unknown as PersonWorkspaceEntity,
        ],
        [
          {
            handle: 'soft-deleted-contact@example.com',
            displayName: 'Contact 1',
          },
        ],
        workspaceId,
        FieldActorSource.CALENDAR,
        mockConnectedAccount,
      );
      expect(createContactService.restorePeople).toHaveBeenCalledWith(
        [
          {
            id: 'contact-1',
            companyId: undefined,
          },
        ],
        workspaceId,
      );
      expect(
        createCompaniesService.createOrRestoreCompanies,
      ).toHaveBeenCalled();
    });
    it('should restore the soft deleted contact - matching primary email', async () => {
      await service.restorePeopleAndRestoreOrCreateCompanies(
        [
          {
            id: 'contact-1',
            emails: {
              primaryEmail: 'primary-email-soft-deleted-contact@example.com',
              additionalEmails: [
                'additional-email-soft-deleted-contact@example.com',
              ],
            },
            deletedAt: new Date(),
          } as unknown as PersonWorkspaceEntity,
        ],
        [
          {
            handle: 'additional-email-soft-deleted-contact@example.com',
            displayName: 'Contact 1',
          },
        ],
        workspaceId,
        FieldActorSource.CALENDAR,
        mockConnectedAccount,
      );
      expect(createContactService.restorePeople).toHaveBeenCalledWith(
        [
          {
            id: 'contact-1',
            companyId: undefined,
          },
        ],
        workspaceId,
      );
      expect(
        createCompaniesService.createOrRestoreCompanies,
      ).toHaveBeenCalled();
    });
    it('should not restore any contact', async () => {
      await service.restorePeopleAndRestoreOrCreateCompanies(
        [
          {
            id: 'contact-1',
            emails: {
              primaryEmail: 'soft-deleted-contact@example.com',
              additionalEmails: [],
            },
            deletedAt: new Date(),
          } as unknown as PersonWorkspaceEntity,
        ],
        [
          {
            handle: 'not-matching-email-soft-deleted-contact@example.com',
            displayName: 'Contact 1',
          },
        ],
        workspaceId,
        FieldActorSource.CALENDAR,
        mockConnectedAccount,
      );
      expect(createContactService.restorePeople).not.toHaveBeenCalled();
      expect(
        createCompaniesService.createOrRestoreCompanies,
      ).not.toHaveBeenCalled();
    });
  });
});
