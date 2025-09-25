import { Injectable } from '@nestjs/common';

import { DeepPartial } from 'typeorm';

import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

@Injectable()
export class CreatePersonService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  public async createPeople(
    peopleToCreate: Partial<PersonWorkspaceEntity>[],
    workspaceId: string,
  ): Promise<DeepPartial<PersonWorkspaceEntity>[]> {
    if (peopleToCreate.length === 0) return [];

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

    const createdPeople = await personRepository.insert(
      peopleToCreate.map((person, index) => ({
        ...person,
        position: lastPersonPosition + index,
      })),
      undefined,
      ['companyId', 'id'],
    );

    return createdPeople.raw;
  }

  public async restorePeople(
    people: { personId: string; companyId: string | undefined }[],
    workspaceId: string,
  ): Promise<DeepPartial<PersonWorkspaceEntity>[]> {
    if (people.length === 0) {
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
      people.map(({ personId, companyId }) => ({
        criteria: personId,
        partialEntity: {
          deletedAt: null,
          companyId,
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
