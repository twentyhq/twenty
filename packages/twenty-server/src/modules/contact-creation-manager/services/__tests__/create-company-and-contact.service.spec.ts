import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { FieldActorSource } from 'twenty-shared/types';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { CreateCompanyAndPersonService } from 'src/modules/contact-creation-manager/services/create-company-and-contact.service';
import { CreateCompanyService } from 'src/modules/contact-creation-manager/services/create-company.service';
import { CreatePersonService } from 'src/modules/contact-creation-manager/services/create-person.service';
import { type Contact } from 'src/modules/contact-creation-manager/types/contact.type';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

describe('CreateCompanyAndPersonService', () => {
  let service: CreateCompanyAndPersonService;

  const mockConnectedAccount = {
    id: 'connected-account-1',
    accountOwner: {
      id: 'workspace-member-1',
    },
  } as unknown as ConnectedAccountEntity;

  beforeEach(async () => {
    const mockCreateCompaniesService = {
      createOrRestoreCompanies: jest.fn(),
    };
    const mockCreatePersonService = {
      restorePeople: jest.fn(),
      enrichPeopleNames: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCompanyAndPersonService,
        {
          provide: CreateCompanyService,
          useValue: mockCreateCompaniesService,
        },
        {
          provide: CreatePersonService,
          useValue: mockCreatePersonService,
        },
        {
          provide: GlobalWorkspaceOrmManager,
          useValue: {},
        },
        {
          provide: ExceptionHandlerService,
          useValue: {},
        },
        {
          provide: getRepositoryToken(UserWorkspaceEntity),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(WorkspaceEntity),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CreateCompanyAndPersonService>(
      CreateCompanyAndPersonService,
    );
  });

  describe('computeContactsThatNeedPersonCreateAndRestoreAndWorkDomainNamesToCreate', () => {
    const mockContacts: Contact[] = [
      {
        handle: 'john.doe@company.com',
        displayName: 'John Doe',
      },
      {
        handle: 'jane.smith@company.com',
        displayName: 'Jane Smith',
      },
      {
        handle: 'personal@email.com',
        displayName: 'Personal Contact',
      },
    ];

    const mockExistingPeople: PersonWorkspaceEntity[] = [
      {
        id: 'soft-deleted-person-1',
        emails: {
          primaryEmail: 'john.doe@company.com',
          additionalEmails: null,
        },
        deletedAt: new Date(),
      } as unknown as PersonWorkspaceEntity,
      {
        id: 'soft-deleted-person-2',
        emails: {
          primaryEmail: 'different@company.com',
          additionalEmails: ['jane.smith@company.com'],
        },
        deletedAt: new Date(),
      } as unknown as PersonWorkspaceEntity,
      {
        id: 'active-person-3',
        emails: {
          primaryEmail: 'active@company.com',
          additionalEmails: null,
        },
        deletedAt: null,
      } as unknown as PersonWorkspaceEntity,
    ];

    it('should identify contacts that need person creation for new contacts', () => {
      const result =
        service.computeContactsThatNeedPersonCreateAndRestoreAndWorkDomainNamesToCreate(
          mockContacts,
          mockExistingPeople,
          FieldActorSource.CALENDAR,
          mockConnectedAccount,
          null,
        );

      expect(result.contactsThatNeedPersonCreate).toHaveLength(1);
      expect(result.contactsThatNeedPersonCreate[0].handle).toBe(
        'personal@email.com',
      );
    });

    it('should identify contacts that need person restoration for soft-deleted contacts', () => {
      const result =
        service.computeContactsThatNeedPersonCreateAndRestoreAndWorkDomainNamesToCreate(
          mockContacts,
          mockExistingPeople,
          FieldActorSource.CALENDAR,
          mockConnectedAccount,
          null,
        );

      expect(result.contactsThatNeedPersonRestore).toHaveLength(2);
      expect(
        result.contactsThatNeedPersonRestore.map((c) => c.handle),
      ).toContain('john.doe@company.com');
      expect(
        result.contactsThatNeedPersonRestore.map((c) => c.handle),
      ).toContain('jane.smith@company.com');
    });

    describe('peopleToEnrichNames', () => {
      const contact: Contact = {
        handle: 'felix@twenty.com',
        displayName: 'Félix Malfait',
      };

      const buildExistingPerson = (
        overrides: Record<string, unknown>,
      ): PersonWorkspaceEntity =>
        ({
          id: 'existing-person-1',
          emails: {
            primaryEmail: 'felix@twenty.com',
            additionalEmails: null,
          },
          name: { firstName: 'Félix', lastName: '' },
          createdBy: { source: FieldActorSource.EMAIL },
          deletedAt: null,
          ...overrides,
        }) as unknown as PersonWorkspaceEntity;

      it('should enrich an empty lastName on an EMAIL-created contact', () => {
        const result =
          service.computeContactsThatNeedPersonCreateAndRestoreAndWorkDomainNamesToCreate(
            [contact],
            [buildExistingPerson({})],
            FieldActorSource.CALENDAR,
            mockConnectedAccount,
            null,
          );

        expect(result.peopleToEnrichNames).toEqual([
          {
            personId: 'existing-person-1',
            name: { firstName: 'Félix', lastName: 'Malfait' },
          },
        ]);
      });

      it('should enrich a contact created from CALENDAR too', () => {
        const result =
          service.computeContactsThatNeedPersonCreateAndRestoreAndWorkDomainNamesToCreate(
            [contact],
            [
              buildExistingPerson({
                createdBy: {
                  source: FieldActorSource.CALENDAR,
                } as PersonWorkspaceEntity['createdBy'],
              }),
            ],
            FieldActorSource.EMAIL,
            mockConnectedAccount,
            null,
          );

        expect(result.peopleToEnrichNames).toHaveLength(1);
      });

      it('should not overwrite an existing non-empty lastName', () => {
        const result =
          service.computeContactsThatNeedPersonCreateAndRestoreAndWorkDomainNamesToCreate(
            [{ handle: 'felix@twenty.com', displayName: 'Felix Smith' }],
            [
              buildExistingPerson({
                name: { firstName: 'Félix', lastName: 'Malfait' },
              }),
            ],
            FieldActorSource.EMAIL,
            mockConnectedAccount,
            null,
          );

        expect(result.peopleToEnrichNames).toEqual([]);
      });

      it('should not touch a manually-created contact', () => {
        const result =
          service.computeContactsThatNeedPersonCreateAndRestoreAndWorkDomainNamesToCreate(
            [contact],
            [
              buildExistingPerson({
                createdBy: {
                  source: FieldActorSource.MANUAL,
                } as PersonWorkspaceEntity['createdBy'],
              }),
            ],
            FieldActorSource.EMAIL,
            mockConnectedAccount,
            null,
          );

        expect(result.peopleToEnrichNames).toEqual([]);
      });

      it('should not touch an IMPORT-created contact', () => {
        const result =
          service.computeContactsThatNeedPersonCreateAndRestoreAndWorkDomainNamesToCreate(
            [contact],
            [
              buildExistingPerson({
                createdBy: {
                  source: FieldActorSource.IMPORT,
                } as PersonWorkspaceEntity['createdBy'],
              }),
            ],
            FieldActorSource.EMAIL,
            mockConnectedAccount,
            null,
          );

        expect(result.peopleToEnrichNames).toEqual([]);
      });

      it('should skip enrichment when the new displayName provides no last name either', () => {
        const result =
          service.computeContactsThatNeedPersonCreateAndRestoreAndWorkDomainNamesToCreate(
            [{ handle: 'felix@twenty.com', displayName: 'Félix' }],
            [buildExistingPerson({})],
            FieldActorSource.EMAIL,
            mockConnectedAccount,
            null,
          );

        expect(result.peopleToEnrichNames).toEqual([]);
      });

      it('should enrich a soft-deleted contact that will be restored in this same batch', () => {
        // Restore runs before enrich in createCompaniesAndPeople — by the time
        // the enrichment UPDATE fires, the row is no longer soft-deleted.
        const result =
          service.computeContactsThatNeedPersonCreateAndRestoreAndWorkDomainNamesToCreate(
            [contact],
            [buildExistingPerson({ deletedAt: new Date() })],
            FieldActorSource.EMAIL,
            mockConnectedAccount,
            null,
          );

        expect(result.peopleToEnrichNames).toEqual([
          {
            personId: 'existing-person-1',
            name: { firstName: 'Félix', lastName: 'Malfait' },
          },
        ]);
      });

      it('should fill firstName when missing and preserve existing lastName', () => {
        const result =
          service.computeContactsThatNeedPersonCreateAndRestoreAndWorkDomainNamesToCreate(
            [contact],
            [
              buildExistingPerson({
                name: { firstName: '', lastName: 'Malfait' },
              }),
            ],
            FieldActorSource.EMAIL,
            mockConnectedAccount,
            null,
          );

        expect(result.peopleToEnrichNames).toEqual([
          {
            personId: 'existing-person-1',
            name: { firstName: 'Félix', lastName: 'Malfait' },
          },
        ]);
      });

      it('should handle a person with a null name field', () => {
        const result =
          service.computeContactsThatNeedPersonCreateAndRestoreAndWorkDomainNamesToCreate(
            [contact],
            [buildExistingPerson({ name: null })],
            FieldActorSource.EMAIL,
            mockConnectedAccount,
            null,
          );

        expect(result.peopleToEnrichNames).toEqual([
          {
            personId: 'existing-person-1',
            name: { firstName: 'Félix', lastName: 'Malfait' },
          },
        ]);
      });

      it('should not emit two enrichments when one Person matches both primary and additional emails in the batch', () => {
        const existingPersonWithMultipleEmails = buildExistingPerson({
          emails: {
            primaryEmail: 'felix@twenty.com',
            additionalEmails: ['felix.personal@example.com'],
          },
        });

        const result =
          service.computeContactsThatNeedPersonCreateAndRestoreAndWorkDomainNamesToCreate(
            [
              { handle: 'felix@twenty.com', displayName: 'Félix Malfait' },
              {
                handle: 'felix.personal@example.com',
                displayName: 'Félix Other',
              },
            ],
            [existingPersonWithMultipleEmails],
            FieldActorSource.EMAIL,
            mockConnectedAccount,
            null,
          );

        expect(result.peopleToEnrichNames).toEqual([
          {
            personId: 'existing-person-1',
            name: { firstName: 'Félix', lastName: 'Malfait' },
          },
        ]);
      });

      it('should merge partial enrichments across contacts mapping to the same Person', () => {
        const existingPersonWithMultipleEmails = buildExistingPerson({
          name: { firstName: '', lastName: '' },
          emails: {
            primaryEmail: 'felix@twenty.com',
            additionalEmails: ['felix.personal@example.com'],
          },
        });

        const result =
          service.computeContactsThatNeedPersonCreateAndRestoreAndWorkDomainNamesToCreate(
            [
              // First contact only carries a first name.
              { handle: 'felix@twenty.com', displayName: 'Félix' },
              // Second contact (additional email) carries both — the lastName
              // should fill in even though the firstName slot is already taken.
              {
                handle: 'felix.personal@example.com',
                displayName: 'Félix Malfait',
              },
            ],
            [existingPersonWithMultipleEmails],
            FieldActorSource.EMAIL,
            mockConnectedAccount,
            null,
          );

        expect(result.peopleToEnrichNames).toEqual([
          {
            personId: 'existing-person-1',
            name: { firstName: 'Félix', lastName: 'Malfait' },
          },
        ]);
      });
    });
  });
});
