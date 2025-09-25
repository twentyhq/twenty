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

    return personRepository.save(peopleToCreate, undefined);
  }

  public async restorePeople(
    personIds: string[],
    workspaceId: string,
  ): Promise<DeepPartial<PersonWorkspaceEntity>[]> {
    if (personIds.length === 0) {
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
        criteria: person.id ?? '',
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
