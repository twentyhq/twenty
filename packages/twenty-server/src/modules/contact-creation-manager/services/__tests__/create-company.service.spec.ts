import { Test, type TestingModule } from '@nestjs/testing';

import {
  ConnectedAccountProvider,
  FieldActorSource,
} from 'twenty-shared/types';

import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import {
  type CompanyToCreate,
  CreateCompanyService,
} from 'src/modules/contact-creation-manager/services/create-company.service';

describe('CreateCompanyService', () => {
  let service: CreateCompanyService;
  let mockCompanyRepository: any;
  let mockHttpService: any;
  let mockQueryBuilder: any;
  let queryBuilderResult: any[] = [];

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
  const companyToCreateBySecondary: CompanyToCreate = {
    domainName: 'alt-domain.com',
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
    queryBuilderResult = [];
    mockQueryBuilder = {
      withDeleted: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockImplementation(() => Promise.resolve(queryBuilderResult)),
    };

    mockCompanyRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      save: jest.fn(),
      maximum: jest.fn().mockResolvedValue(0),
      updateMany: jest.fn(),
    };

    mockHttpService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCompanyService,
        {
          provide: SecureHttpClientService,
          useValue: {
            getHttpClient: jest.fn().mockReturnValue(mockHttpService),
          },
        },
        {
          provide: GlobalWorkspaceOrmManager,
          useValue: {
            getRepository: jest.fn().mockResolvedValue(mockCompanyRepository),
            executeInWorkspaceContext: jest
              .fn()
              .mockImplementation((fn: () => any, _authContext?: any) => fn()),
          },
        },
      ],
    }).compile();

    service = module.get<CreateCompanyService>(CreateCompanyService);
  });

  describe('With no existing companies', () => {
    beforeEach(() => {
      queryBuilderResult = [];
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

      expect(mockCompanyRepository.createQueryBuilder).toHaveBeenCalled();
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

      expect(mockCompanyRepository.createQueryBuilder).toHaveBeenCalled();
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

      expect(mockCompanyRepository.createQueryBuilder).toHaveBeenCalled();
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
      queryBuilderResult = [
        {
          id: 'existing-company-1',
          domainName: {
            primaryLinkUrl: 'https://existing-company.com',
            secondaryLinks: null,
          },
        },
      ];
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

      expect(mockCompanyRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockCompanyRepository.save).toHaveBeenCalledWith([]);
    });
  });

  describe('With existing companies and some deleted', () => {
    beforeEach(() => {
      queryBuilderResult = [
        {
          id: 'soft-deleted-company-1',
          domainName: {
            primaryLinkUrl: 'https://soft-deleted-company.com',
            secondaryLinks: null,
          },
          deletedAt: new Date(),
        },
      ];
      mockCompanyRepository.save.mockResolvedValue([]);
      mockCompanyRepository.updateMany.mockResolvedValue({
        raw: [
          {
            id: 'soft-deleted-company-1',
            domainNamePrimaryLinkUrl: 'https://soft-deleted-company.com',
            domainNameSecondaryLinks: null,
          },
        ],
      });
    });

    it('should restore the soft deleted company', async () => {
      await service.createOrRestoreCompanies([companyToRestore], workspaceId);

      expect(mockCompanyRepository.createQueryBuilder).toHaveBeenCalled();
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
        ['domainNamePrimaryLinkUrl', 'domainNameSecondaryLinks', 'id'],
      );
    });
  });

  describe('When the email domain matches a secondary link', () => {
    beforeEach(() => {
      queryBuilderResult = [
        {
          id: 'existing-company-with-secondary',
          domainName: {
            primaryLinkUrl: 'https://primary.com',
            secondaryLinks: [{ label: 'Alt', url: 'https://alt-domain.com' }],
          },
        },
      ];
      mockCompanyRepository.save.mockResolvedValue([]);
      mockCompanyRepository.updateMany.mockResolvedValue({ raw: [] });
    });

    it('should not create a duplicate company when domain matches an existing secondary link', async () => {
      const result = await service.createOrRestoreCompanies(
        [companyToCreateBySecondary],
        workspaceId,
      );

      expect(mockCompanyRepository.save).toHaveBeenCalledWith([]);
      expect(result['alt-domain.com']).toBe('existing-company-with-secondary');
      expect(result['primary.com']).toBe('existing-company-with-secondary');
    });

    it('should restore a soft-deleted company matched by a secondary domain', async () => {
      queryBuilderResult = [
        {
          id: 'soft-deleted-secondary-match',
          domainName: {
            primaryLinkUrl: 'https://other.com',
            secondaryLinks: [{ label: 'Alt', url: 'https://alt-domain.com' }],
          },
          deletedAt: new Date(),
        },
      ];
      mockCompanyRepository.updateMany.mockResolvedValue({
        raw: [
          {
            id: 'soft-deleted-secondary-match',
            domainNamePrimaryLinkUrl: 'https://other.com',
            domainNameSecondaryLinks: [
              { label: 'Alt', url: 'https://alt-domain.com' },
            ],
          },
        ],
      });

      await service.createOrRestoreCompanies(
        [companyToCreateBySecondary],
        workspaceId,
      );

      expect(mockCompanyRepository.save).toHaveBeenCalledWith([]);
      expect(mockCompanyRepository.updateMany).toHaveBeenCalledWith(
        [
          {
            criteria: 'soft-deleted-secondary-match',
            partialEntity: { deletedAt: null },
          },
        ],
        undefined,
        ['domainNamePrimaryLinkUrl', 'domainNameSecondaryLinks', 'id'],
      );
    });
  });
});
