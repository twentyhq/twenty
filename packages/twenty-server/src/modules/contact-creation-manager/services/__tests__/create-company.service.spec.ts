import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import axios from 'axios';
import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';
import {
  ConnectedAccountProvider,
  FieldActorSource,
} from 'twenty-shared/types';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import {
  type CompanyToCreate,
  CreateCompanyService,
} from 'src/modules/contact-creation-manager/services/create-company.service';

jest.mock('axios');

describe('CreateCompanyService', () => {
  let service: CreateCompanyService;
  let mockCompanyRepository: any;
  let mockHttpService: any;

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
  const companyToRestore: CompanyToCreate = {
    domainName: 'soft-deleted-company.com',
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
      updateMany: jest.fn(),
    };

    mockHttpService = {
      get: jest.fn(),
    };

    (axios.create as jest.Mock).mockReturnValue(mockHttpService);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCompanyService,
        {
          provide: GlobalWorkspaceOrmManager,
          useValue: {
            getRepository: jest.fn().mockResolvedValue(mockCompanyRepository),
            executeInWorkspaceContext: jest
              .fn()
              .mockImplementation((_authContext: any, fn: () => any) => fn()),
          },
        },
        {
          provide: getRepositoryToken(ObjectMetadataEntity),
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

      mockCompanyRepository.updateMany.mockResolvedValue({
        raw: [],
      });
    });

    it('should successfully create a company', async () => {
      mockHttpService.get.mockResolvedValue({
        data: {
          name: 'Example1',
          city: undefined,
        },
      });

      await service.createOrRestoreCompanies([companyToCreate1], workspaceId);

      expect(mockCompanyRepository.find).toHaveBeenCalled();
      expect(mockCompanyRepository.save).toHaveBeenCalledWith([
        inputForCompanyToCreate1,
      ]);
    });

    it('should successfully two companies', async () => {
      mockHttpService.get
        .mockResolvedValueOnce({
          data: {
            name: 'Example1',
            city: undefined,
          },
        })
        .mockResolvedValueOnce({
          data: {
            name: 'BNQ',
            city: '',
          },
        });

      await service.createOrRestoreCompanies(
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
      await service.createOrRestoreCompanies(
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
      mockCompanyRepository.updateMany.mockResolvedValue({
        raw: [],
      });
    });

    it('should not create a company if it already exists', async () => {
      await service.createOrRestoreCompanies(
        [companyToCreateExisting],
        workspaceId,
      );

      expect(mockCompanyRepository.find).toHaveBeenCalled();
      expect(mockCompanyRepository.save).toHaveBeenCalledWith([]);
    });
  });

  describe('With existing companies and some deleted', () => {
    beforeEach(() => {
      mockCompanyRepository.find.mockResolvedValue([
        {
          id: 'soft-deleted-company-1',
          domainName: { primaryLinkUrl: 'https://soft-deleted-company.com' },
          deletedAt: new Date(),
        },
      ]);
      mockCompanyRepository.save.mockResolvedValue([]);
      mockCompanyRepository.updateMany.mockResolvedValue({
        raw: [
          {
            id: 'soft-deleted-company-1',
            domainNamePrimaryLinkUrl: 'https://soft-deleted-company.com',
          },
        ],
      });
    });

    it('should restore the soft deleted company', async () => {
      await service.createOrRestoreCompanies([companyToRestore], workspaceId);

      expect(mockCompanyRepository.find).toHaveBeenCalled();
      expect(mockCompanyRepository.save).toHaveBeenCalledWith([]);
      expect(mockCompanyRepository.updateMany).toHaveBeenCalledWith(
        [
          {
            criteria: 'soft-deleted-company-1',
            partialEntity: {
              deletedAt: null,
            },
          },
        ],
        undefined,
        ['domainNamePrimaryLinkUrl', 'id'],
      );
    });
  });
});
