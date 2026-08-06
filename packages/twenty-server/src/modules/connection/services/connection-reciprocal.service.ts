import { Injectable } from '@nestjs/common';

import { In } from 'typeorm';
import { type FullNameMetadata } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { composeConnectionName } from 'src/modules/connection/utils/compose-connection-name.util';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

// Reciprocals are maintained by the system, not by the actor whose edit
// triggered them, so their own role must not gate it.
const SYSTEM_MAINTAINED_FIELD_PERMISSIONS: RolePermissionConfig = {
  shouldBypassPermissionChecks: true,
};

// connection is a custom object, so it has no generated workspace entity class
type ConnectionRecord = {
  id: string;
  name: string | null;
  personId: string | null;
  connectedToId: string | null;
  connectionType: string | null;
  isReciprocal: boolean | null;
};

@Injectable()
export class ConnectionReciprocalService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  private async getConnectionRepository(workspaceId: string) {
    return await this.globalWorkspaceOrmManager.getRepository<ConnectionRecord>(
      workspaceId,
      'connection',
      SYSTEM_MAINTAINED_FIELD_PERMISSIONS,
    );
  }

  async createMissingReciprocals({
    workspaceId,
    connectionIds,
  }: {
    workspaceId: string;
    // Omit to sweep every connection, as the one-off backfill does
    connectionIds?: string[];
  }): Promise<number> {
    const connectionRepository =
      await this.getConnectionRepository(workspaceId);

    if (isDefined(connectionIds) && connectionIds.length === 0) {
      return 0;
    }

    const candidates = await connectionRepository.find({
      ...(isDefined(connectionIds)
        ? { where: { id: In([...new Set(connectionIds)]) } }
        : {}),
    });

    // A reciprocal never gets its own reciprocal, otherwise the pair grows
    const sourceConnections = candidates.filter(
      (connection) =>
        connection.isReciprocal !== true &&
        isDefined(connection.personId) &&
        isDefined(connection.connectedToId),
    );

    if (sourceConnections.length === 0) {
      return 0;
    }

    const existingConnections = await connectionRepository.find({});
    const existingPairKeys = new Set(
      existingConnections.map((connection) =>
        this.buildPairKey(connection.personId, connection.connectedToId),
      ),
    );

    const personNameById = await this.getPersonNameById({
      workspaceId,
      personIds: sourceConnections.flatMap((connection) => [
        connection.personId,
        connection.connectedToId,
      ]),
    });

    let createdCount = 0;

    for (const connection of sourceConnections) {
      const reciprocalPairKey = this.buildPairKey(
        connection.connectedToId,
        connection.personId,
      );

      if (existingPairKeys.has(reciprocalPairKey)) {
        continue;
      }

      await connectionRepository.insert({
        id: v4(),
        personId: connection.connectedToId,
        connectedToId: connection.personId,
        connectionType: connection.connectionType,
        isReciprocal: true,
        name:
          composeConnectionName({
            personName:
              personNameById.get(connection.connectedToId ?? '') ?? null,
            connectedToName:
              personNameById.get(connection.personId ?? '') ?? null,
          }) ?? null,
      });

      existingPairKeys.add(reciprocalPairKey);
      createdCount += 1;
    }

    return createdCount;
  }

  async deleteReciprocalsOf({
    workspaceId,
    connections,
  }: {
    workspaceId: string;
    connections: Pick<ConnectionRecord, 'personId' | 'connectedToId'>[];
  }): Promise<void> {
    const connectionRepository =
      await this.getConnectionRepository(workspaceId);

    for (const connection of connections) {
      if (
        !isDefined(connection.personId) ||
        !isDefined(connection.connectedToId)
      ) {
        continue;
      }

      // Only the generated side is removed, so deleting a reciprocal by hand
      // never takes the relationship the person actually recorded with it
      await connectionRepository.delete({
        personId: connection.connectedToId,
        connectedToId: connection.personId,
        isReciprocal: true,
      });
    }
  }

  private buildPairKey(
    personId: string | null,
    connectedToId: string | null,
  ): string {
    return `${personId ?? ''}:${connectedToId ?? ''}`;
  }

  private async getPersonNameById({
    workspaceId,
    personIds,
  }: {
    workspaceId: string;
    personIds: (string | null)[];
  }): Promise<Map<string, FullNameMetadata | null>> {
    const definedPersonIds = [...new Set(personIds.filter(isDefined))];

    if (definedPersonIds.length === 0) {
      return new Map();
    }

    const personRepository =
      await this.globalWorkspaceOrmManager.getRepository<PersonWorkspaceEntity>(
        workspaceId,
        'person',
        SYSTEM_MAINTAINED_FIELD_PERMISSIONS,
      );

    const people = await personRepository.find({
      where: { id: In(definedPersonIds) },
    });

    return new Map(people.map((person) => [person.id, person.name]));
  }
}
