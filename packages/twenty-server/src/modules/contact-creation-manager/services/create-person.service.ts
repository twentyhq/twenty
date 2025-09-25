import { Injectable } from '@nestjs/common';

import { type ConnectedAccountProvider } from 'twenty-shared/types';
import { type DeepPartial } from 'typeorm';
import { v4 } from 'uuid';

import { type FieldActorSource } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { getFirstNameAndLastNameFromHandleAndDisplayName } from 'src/modules/contact-creation-manager/utils/get-first-name-and-last-name-from-handle-and-display-name.util';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
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

type PersonToRestore = {
  id: string;
  companyId?: string;
};

@Injectable()
export class CreatePersonService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  private formatContacts(
    contactsToCreate: ContactToCreate[],
    lastPersonPosition: number,
  ): DeepPartial<PersonWorkspaceEntity>[] {
    return contactsToCreate.map((person) => {
      const id = v4();

      const {
        handle,
        displayName,
        companyId,
        createdBySource,
        createdByWorkspaceMember,
        createdByContext,
      } = person;

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
          workspaceMemberId: person.createdByWorkspaceMember?.id,
          name: createdByName,
          context: createdByContext,
        },
        position: ++lastPersonPosition,
      };
    });
  }

  public async createOrRestorePeople(
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

    const peopleToCreate = this.formatContacts(
      contactsToCreate,
      lastPersonPosition,
    );

    return personRepository.save(peopleToCreate, undefined);
  }

  public async restorePeople(
    peopleToRestore: PersonToRestore[],
    workspaceId: string,
  ): Promise<DeepPartial<PersonWorkspaceEntity>[]> {
    if (peopleToRestore.length === 0) {
      return [];
    }

    const personRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        PersonWorkspaceEntity,
        {
          shouldBypassPermissionChecks: true,
        },
      );

    const restoredPeople = await personRepository.updateMany(
      peopleToRestore.map((person) => ({
        criteria: person.id,
        partialEntity: {
          companyId: person.companyId,
          deletedAt: null,
        },
      })),
      undefined,
      ['companyId', 'id'],
    );

    return restoredPeople.raw;
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
