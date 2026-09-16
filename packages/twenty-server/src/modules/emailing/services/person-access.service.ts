import { Injectable } from '@nestjs/common';

import chunk from 'lodash.chunk';
import { In } from 'typeorm';

import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

const FIND_BY_IDS_CHUNK_SIZE = 5_000;

@Injectable()
export class PersonAccessService {
  constructor(private readonly workspaceOrmManager: WorkspaceOrmManager) {}

  async findReadablePersonIds({
    roleId,
    personIds,
  }: {
    roleId: string;
    personIds: string[];
  }): Promise<Set<string>> {
    if (personIds.length === 0) {
      return new Set();
    }

    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const personRepository = this.workspaceOrmManager.getRepository(
        PersonWorkspaceEntity,
        { unionOf: [roleId] },
      );
      const readablePersonIds = new Set<string>();

      for (const personIdsChunk of chunk(personIds, FIND_BY_IDS_CHUNK_SIZE)) {
        const people = await personRepository.find({
          where: { id: In(personIdsChunk) },
          select: { id: true },
        });

        for (const person of people) {
          readablePersonIds.add(person.id);
        }
      }

      return readablePersonIds;
    });
  }
}
