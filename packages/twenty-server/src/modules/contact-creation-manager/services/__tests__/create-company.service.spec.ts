import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { FieldActorSource } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import {
  CompanyToCreate,
  CreateCompanyService,
} from 'src/modules/contact-creation-manager/services/create-company.service';

describe('CreateCompanyService', () => {
  let service: CreateCompanyService;
  let mockCompanyRepository: any;

  const workspaceId = 'workspace-1';

  const companyToCreate1: CompanyToCreate = {
    domainName: 'example1.com',
    createdBySource: FieldActorSource.MANUAL,
    createdByContext: {
      provider: ConnectedAccountProvider.GOOGLE,
    },
  };
  const companyToCreate1withSlash: CompanyToCreate = {
    domainName: 'example1.com/',
    createdBySource: FieldActorSource.MANUAL,
    createdByContext: {
      provider: ConnectedAccountProvider.GOOGLE,
    },
  };
  const companyToCreate2: CompanyToCreate = {
    domainName: 'example2.com',
    createdBySource: FieldActorSource.MANUAL,
    createdByContext: {
      provider: ConnectedAccountProvider.GOOGLE,
    },
  };
  const companyToCreateExisting: CompanyToCreate = {
    domainName: 'existing-company.com',
    createdBySource: FieldActorSource.MANUAL,
    createdByContext: {
      provider: ConnectedAccountProvider.GOOGLE,
    },
  };
  const inputForCompanyToCreate1 = {
    address: {
      addressCity: undefined,
    },
    createdBy: {
      context: {
        provider: 'google',
      },
      name: '',
      source: 'MANUAL',
      workspaceMemberId: undefined,
    },
    domainName: {
      primaryLinkUrl: 'https://example1.com',
    },
    name: 'Example1',
    position: 1,
  };

  const inputForCompanyToCreate2 = {
    address: {
      addressCity: '',
    },
    createdBy: {
      context: {
        provider: 'google',
      },
      name: '',
      source: 'MANUAL',
      workspaceMemberId: undefined,
    },
    domainName: {
      primaryLinkUrl: 'https://example2.com',
    },
    name: 'BNQ',
    position: 2,
  };

  beforeEach(async () => {
    mockCompanyRepository = {
      find: jest.fn(),
      save: jest.fn(),
      maximum: jest.fn().mockResolvedValue(0),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCompanyService,
        {
          provide: TwentyORMGlobalManager,
          useValue: {
            getRepositoryForWorkspace: jest
              .fn()
              .mockResolvedValue(mockCompanyRepository),
          },
        },
        {
          provide: getRepositoryToken(ObjectMetadataEntity, 'core'),
          useValue: {
            findOne: jest.fn().mockResolvedValue({
              id: 'mock-object-metadata-id',
              standardId: STANDARD_OBJECT_IDS.company,
              workspaceId,
              nameSingular: 'company',
              namePlural: 'companies',
              labelSingular: 'Company',
              labelPlural: 'Companies',
              targetTableName: 'company',
              isCustom: false,
              isRemote: false,
              isActive: true,
              isSystem: false,
              isAuditLogged: true,
              isSearchable: true,
              isLabelSyncedWithName: false,
            }),
          },
        },
      ],
    }).compile();

    service = module.get<CreateCompanyService>(CreateCompanyService);
  });

  describe('With no existing companies', () => {
    beforeEach(() => {
      mockCompanyRepository.find.mockResolvedValue([]);
      // it is useless to check results here, we can only check the input it was called with
      mockCompanyRepository.save.mockResolvedValue([]);
    });

    it('should successfully create a company', async () => {
      await service.createCompanies([companyToCreate1], workspaceId);

      expect(mockCompanyRepository.find).toHaveBeenCalled();
      expect(mockCompanyRepository.save).toHaveBeenCalledWith([
        inputForCompanyToCreate1,
      ]);
    });

    it('should successfully two companies', async () => {
      await service.createCompanies(
        [companyToCreate1, companyToCreate2],
        workspaceId,
      );

      expect(mockCompanyRepository.find).toHaveBeenCalled();
      expect(mockCompanyRepository.save).toHaveBeenCalledWith([
        inputForCompanyToCreate1,
        inputForCompanyToCreate2,
      ]);
    });

    it('should create only one of example.com & example.com/ ', async () => {
      await service.createCompanies(
        [companyToCreate1, companyToCreate1withSlash],
        workspaceId,
      );

      expect(mockCompanyRepository.find).toHaveBeenCalled();
      expect(mockCompanyRepository.save).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            domainName: {
              primaryLinkUrl: 'https://example1.com',
            },
          }),
        ]),
      );
    });
  });

  describe('With existing companies', () => {
    beforeEach(() => {
      mockCompanyRepository.find.mockResolvedValue([
        {
          id: 'existing-company-1',
          domainName: { primaryLinkUrl: 'https://existing-company.com' },
        },
      ]);
      mockCompanyRepository.save.mockResolvedValue([]);
    });

    it('should not create a company if it already exists', async () => {
      await service.createCompanies([companyToCreateExisting], workspaceId);

      expect(mockCompanyRepository.find).toHaveBeenCalled();
      expect(mockCompanyRepository.save).not.toHaveBeenCalled();
    });
  });
});
