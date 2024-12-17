import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import chunk from 'lodash.chunk';
import compact from 'lodash.compact';
import { Any, EntityManager, Repository } from 'typeorm';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { FieldActorSource } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { CONTACTS_CREATION_BATCH_SIZE } from 'src/modules/contact-creation-manager/constants/contacts-creation-batch-size.constant';
import { CreateCompanyService } from 'src/modules/contact-creation-manager/services/create-company.service';
import { CreateContactService } from 'src/modules/contact-creation-manager/services/create-contact.service';
import { Contact } from 'src/modules/contact-creation-manager/types/contact.type';
import { filterOutSelfAndContactsFromCompanyOrWorkspace } from 'src/modules/contact-creation-manager/utils/filter-out-contacts-from-company-or-workspace.util';
import { getDomainNameFromHandle } from 'src/modules/contact-creation-manager/utils/get-domain-name-from-handle.util';
import { getUniqueContactsAndHandles } from 'src/modules/contact-creation-manager/utils/get-unique-contacts-and-handles.util';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { WorkspaceMemberRepository } from 'src/modules/workspace-member/repositories/workspace-member.repository';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { isWorkEmail } from 'src/utils/is-work-email';

@Injectable()
export class CreateCompanyAndContactService {
  constructor(
    private readonly createContactService: CreateContactService,
    private readonly createCompaniesService: CreateCompanyService,
    @InjectObjectMetadataRepository(WorkspaceMemberWorkspaceEntity)
    private readonly workspaceMemberRepository: WorkspaceMemberRepository,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  private async createCompaniesAndPeople(
    connectedAccount: ConnectedAccountWorkspaceEntity,
    contactsToCreate: Contact[],
    workspaceId: string,
    source: FieldActorSource,
    transactionManager?: EntityManager,
  ): Promise<DeepPartial<PersonWorkspaceEntity>[]> {
    if (!contactsToCreate || contactsToCreate.length === 0) {
      return [];
    }

    const personRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        PersonWorkspaceEntity,
      );

    const workspaceMembers =
      await this.workspaceMemberRepository.getAllByWorkspaceId(
        workspaceId,
        transactionManager,
      );

    const contactsToCreateFromOtherCompanies =
      filterOutSelfAndContactsFromCompanyOrWorkspace(
        contactsToCreate,
        connectedAccount,
        workspaceMembers,
      );

    const { uniqueContacts, uniqueHandles } = getUniqueContactsAndHandles(
      contactsToCreateFromOtherCompanies,
    );

    if (uniqueHandles.length === 0) {
      return [];
    }

    const alreadyCreatedContacts = await personRepository.find({
      where: {
        emails: { primaryEmail: Any(uniqueHandles) },
      },
    });

    const alreadyCreatedContactEmails: string[] = alreadyCreatedContacts?.map(
      ({ emails }) => emails?.primaryEmail,
    );

    const filteredContactsToCreate = uniqueContacts.filter(
      (participant) =>
        !alreadyCreatedContactEmails.includes(participant.handle) &&
        participant.handle.includes('@'),
    );

    const filteredContactsToCreateWithCompanyDomainNames =
      filteredContactsToCreate?.map((participant) => ({
        handle: participant.handle,
        displayName: participant.displayName,
        companyDomainName: isWorkEmail(participant.handle)
          ? getDomainNameFromHandle(participant.handle)
          : undefined,
      }));

    const domainNamesToCreate = compact(
      filteredContactsToCreateWithCompanyDomainNames
        .filter((participant) => participant.companyDomainName)
        .map((participant) => ({
          domainName: participant.companyDomainName,
          createdBySource: source,
          createdByWorkspaceMember: connectedAccount.accountOwner,
        })),
    );

    const companiesObject = await this.createCompaniesService.createCompanies(
      domainNamesToCreate,
      workspaceId,
      transactionManager,
    );

    const formattedContactsToCreate =
      filteredContactsToCreateWithCompanyDomainNames.map((contact) => ({
        handle: contact.handle,
        displayName: contact.displayName,
        companyId:
          contact.companyDomainName && contact.companyDomainName !== ''
            ? companiesObject[contact.companyDomainName]
            : undefined,
        createdBySource: source,
        createdByWorkspaceMember: connectedAccount.accountOwner,
      }));

    return this.createContactService.createPeople(
      formattedContactsToCreate,
      workspaceId,
      transactionManager,
    );
  }

  async createCompaniesAndContactsAndUpdateParticipants(
    connectedAccount: ConnectedAccountWorkspaceEntity,
    contactsToCreate: Contact[],
    workspaceId: string,
    source: FieldActorSource,
  ) {
    const contactsBatches = chunk(
      contactsToCreate,
      CONTACTS_CREATION_BATCH_SIZE,
    );

    // TODO: Remove this when events are emitted directly inside TwentyORM

    const objectMetadata = await this.objectMetadataRepository.findOne({
      where: {
        standardId: STANDARD_OBJECT_IDS.person,
        workspaceId,
      },
    });

    if (!objectMetadata) {
      throw new Error('Object metadata not found');
    }

    // In some jobs the accountOwner is not populated
    if (!connectedAccount.accountOwner) {
      const workspaceMemberRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace(
          workspaceId,
          WorkspaceMemberWorkspaceEntity,
        );

      const workspaceMember = await workspaceMemberRepository.findOne({
        where: {
          id: connectedAccount.accountOwnerId,
        },
      });

      if (!workspaceMember) {
        throw new Error(
          `Workspace member with id ${connectedAccount.accountOwnerId} not found in workspace ${workspaceId}`,
        );
      }

      connectedAccount.accountOwner = workspaceMember;
    }

    for (const contactsBatch of contactsBatches) {
      const createdPeople = await this.createCompaniesAndPeople(
        connectedAccount,
        contactsBatch,
        workspaceId,
        source,
      );

      this.workspaceEventEmitter.emitDatabaseBatchEvent({
        objectMetadataNameSingular: 'person',
        action: DatabaseEventAction.CREATED,
        events: createdPeople.map((createdPerson) => ({
          // Fix ' as string': TypeORM typing issue... id is always returned when using save
          recordId: createdPerson.id as string,
          objectMetadata,
          properties: {
            after: createdPerson,
          },
        })),
        workspaceId,
      });
    }
  }
}
