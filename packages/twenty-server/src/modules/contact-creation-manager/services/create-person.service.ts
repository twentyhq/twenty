import { Injectable } from '@nestjs/common';

import { type FullNameMetadata } from 'twenty-shared/types';
import { DeepPartial } from 'typeorm';

import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
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
    transactionManager?: WorkspaceEntityManager,
  ): Promise<DeepPartial<PersonWorkspaceEntity>[]> {
    if (peopleToCreate.length === 0) return [];

    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const personRepository =
          await this.globalWorkspaceOrmManager.getRepository(
            workspaceId,
            PersonWorkspaceEntity,
            {
              shouldBypassPermissionChecks: true,
            },
          );

        const lastPersonPosition = await this.getLastPersonPosition(
          personRepository,
          transactionManager,
        );

        const createdPeople = await personRepository.insert(
          peopleToCreate.map((person, index) => ({
            ...person,
            position: lastPersonPosition + index,
          })),
          transactionManager,
          ['companyId', 'id'],
        );

        return createdPeople.raw;
      },
      authContext,
    );
  }

  public async restorePeople(
    people: { personId: string; companyId: string | undefined }[],
    workspaceId: string,
    transactionManager?: WorkspaceEntityManager,
  ): Promise<DeepPartial<PersonWorkspaceEntity>[]> {
    if (people.length === 0) {
      return [];
    }

    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
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
          transactionManager,
          ['companyId', 'id'],
        );

        return restoredPeople.raw;
      },
      authContext,
    );
  }

  public async enrichPeopleNames(
    peopleToEnrich: { personId: string; name: FullNameMetadata }[],
    workspaceId: string,
    transactionManager?: WorkspaceEntityManager,
  ): Promise<DeepPartial<PersonWorkspaceEntity>[]> {
    if (peopleToEnrich.length === 0) {
      return [];
    }

    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const personRepository =
          await this.globalWorkspaceOrmManager.getRepository(
            workspaceId,
            PersonWorkspaceEntity,
            {
              shouldBypassPermissionChecks: true,
            },
          );

        const enrichedPeople = await personRepository.updateMany(
          peopleToEnrich.map(({ personId, name }) => ({
            criteria: personId,
            partialEntity: { name },
          })),
          transactionManager,
          ['id'],
        );

        return enrichedPeople.raw;
      },
      authContext,
    );
  }

  private async getLastPersonPosition(
    personRepository: WorkspaceRepository<PersonWorkspaceEntity>,
    transactionManager?: WorkspaceEntityManager,
  ): Promise<number> {
    const lastPersonPosition = await personRepository.maximum(
      'position',
      undefined,
      transactionManager,
    );

    return lastPersonPosition ?? 0;
  }
}
