import { Injectable } from '@nestjs/common';

import { ConnectedAccountProvider } from 'twenty-shared/types';
import { DeepPartial } from 'typeorm';
import { v4 } from 'uuid';

import { FieldActorSource } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { getFirstNameAndLastNameFromHandleAndDisplayName } from 'src/modules/contact-creation-manager/utils/get-first-name-and-last-name-from-handle-and-display-name.util';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { computeDisplayName } from 'src/utils/compute-display-name';

type ContactToCreate = {
  handle: string;
  displayName: string;
  companyId?: string;
  createdBySource: FieldActorSource;
  createdByWorkspaceMember?: WorkspaceMemberWorkspaceEntity | null;
  createdByContext?: {
    provider?: ConnectedAccountProvider;
  };
};

@Injectable()
export class CreateContactService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  private formatContacts(
    contactsToCreate: ContactToCreate[],
    lastPersonPosition: number,
  ): DeepPartial<PersonWorkspaceEntity>[] {
    return contactsToCreate.map((contact) => {
      const id = v4();

      const {
        handle,
        displayName,
        companyId,
        createdBySource,
        createdByWorkspaceMember,
        createdByContext,
      } = contact;

      const { firstName, lastName } =
        getFirstNameAndLastNameFromHandleAndDisplayName(handle, displayName);
      const createdByName = computeDisplayName(createdByWorkspaceMember?.name);

      return {
        id,
        emails: {
          primaryEmail: handle.toLowerCase(),
          additionalEmails: null,
        },
        name: {
          firstName,
          lastName,
        },
        companyId,
        createdBy: {
          source: createdBySource,
          workspaceMemberId: contact.createdByWorkspaceMember?.id,
          name: createdByName,
          context: createdByContext,
        },
        position: ++lastPersonPosition,
      };
    });
  }

  public async createPeople(
    contactsToCreate: ContactToCreate[],
    workspaceId: string,
  ): Promise<DeepPartial<PersonWorkspaceEntity>[]> {
    if (contactsToCreate.length === 0) return [];

    const personRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        PersonWorkspaceEntity,
        {
          shouldBypassPermissionChecks: true,
        },
      );

    const lastPersonPosition =
      await this.getLastPersonPosition(personRepository);

    const formattedContacts = this.formatContacts(
      contactsToCreate,
      lastPersonPosition,
    );

    return personRepository.save(formattedContacts, undefined);
  }

  private async getLastPersonPosition(
    personRepository: WorkspaceRepository<PersonWorkspaceEntity>,
  ): Promise<number> {
    const lastPersonPosition = await personRepository.maximum(
      'position',
      undefined,
    );

    return lastPersonPosition ?? 0;
  }
}
