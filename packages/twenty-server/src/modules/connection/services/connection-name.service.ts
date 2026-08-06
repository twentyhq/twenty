import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { In } from 'typeorm';
import { type FullNameMetadata } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { composeConnectionName } from 'src/modules/connection/utils/compose-connection-name.util';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

// The label is derived and written by the system, not by the actor whose edit
// triggered it, so their own role must not gate it.
const SYSTEM_MAINTAINED_FIELD_PERMISSIONS: RolePermissionConfig = {
  shouldBypassPermissionChecks: true,
};

// connection is a custom object, so it has no generated workspace entity class
type ConnectionRecord = {
  id: string;
  name: string | null;
  personId: string | null;
  connectedToId: string | null;
};

@Injectable()
export class ConnectionNameService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async fillMissingNamesForConnectionIds({
    workspaceId,
    connectionIds,
  }: {
    workspaceId: string;
    connectionIds: string[];
  }): Promise<void> {
    const uniqueConnectionIds = [...new Set(connectionIds)];

    if (uniqueConnectionIds.length === 0) {
      return;
    }

    const connectionRepository =
      await this.globalWorkspaceOrmManager.getRepository<ConnectionRecord>(
        workspaceId,
        'connection',
        SYSTEM_MAINTAINED_FIELD_PERMISSIONS,
      );

    const connections = await connectionRepository.find({
      where: { id: In(uniqueConnectionIds) },
      select: {
        id: true,
        name: true,
        personId: true,
        connectedToId: true,
      },
    });

    // A name the import or a person already set is theirs to keep
    const connectionsToName = connections.filter(
      (connection) => !isNonEmptyString(connection.name),
    );

    if (connectionsToName.length === 0) {
      return;
    }

    const personIds = connectionsToName
      .flatMap((connection) => [connection.personId, connection.connectedToId])
      .filter(isDefined);

    if (personIds.length === 0) {
      return;
    }

    const personRepository =
      await this.globalWorkspaceOrmManager.getRepository<PersonWorkspaceEntity>(
        workspaceId,
        'person',
        SYSTEM_MAINTAINED_FIELD_PERMISSIONS,
      );

    const people = await personRepository.find({
      where: { id: In([...new Set(personIds)]) },
      select: { id: true, name: true },
    });

    const personNameById = new Map<string, FullNameMetadata | null>(
      people.map((person) => [person.id, person.name]),
    );

    for (const connection of connectionsToName) {
      if (
        !isDefined(connection.personId) ||
        !isDefined(connection.connectedToId)
      ) {
        continue;
      }

      const name = composeConnectionName({
        personName: personNameById.get(connection.personId) ?? null,
        connectedToName: personNameById.get(connection.connectedToId) ?? null,
      });

      if (!isDefined(name)) {
        continue;
      }

      await connectionRepository.update({ id: connection.id }, { name });
    }
  }
}
