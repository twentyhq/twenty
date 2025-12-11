import { Injectable } from '@nestjs/common';

import { DeepPartial } from 'typeorm';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

@Injectable()
export class CreatePersonService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  public async createPeople(
    peopleToCreate: Partial<PersonWorkspaceEntity>[],
    workspaceId: string,
  ): Promise<DeepPartial<PersonWorkspaceEntity>[]> {
    if (peopleToCreate.length === 0) return [];

    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const personRepository =
          await this.globalWorkspaceOrmManager.getRepository(
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
      },
    );
  }

  public async restorePeople(
    people: { personId: string; companyId: string | undefined }[],
    workspaceId: string,
  ): Promise<DeepPartial<PersonWorkspaceEntity>[]> {
    if (people.length === 0) {
      return [];
    }

    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const personRepository =
          await this.globalWorkspaceOrmManager.getRepository(
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
      },
    );
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
