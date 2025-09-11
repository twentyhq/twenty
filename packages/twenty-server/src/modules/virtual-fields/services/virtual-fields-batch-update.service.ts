import { Injectable, Logger } from '@nestjs/common';

import { In, type FindOptionsWhere, type ObjectLiteral } from 'typeorm';

import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { PrimitiveValue } from 'src/modules/virtual-fields/types/PrimitiveValue';

type BatchUpdateOperation = {
  entityId: string;
  fieldName: string;
  value: PrimitiveValue;
};

@Injectable()
export class VirtualFieldsBatchUpdateService {
  private readonly logger = new Logger(VirtualFieldsBatchUpdateService.name);

  async executeBatchUpdates<T extends ObjectLiteral>(
    repository: WorkspaceRepository<T>,
    updateOperations: BatchUpdateOperation[],
  ): Promise<void> {
    if (updateOperations.length === 0) {
      return;
    }

    const updatesByEntity = new Map<string, Record<string, PrimitiveValue>>();

    for (const operation of updateOperations) {
      if (!updatesByEntity.has(operation.entityId)) {
        updatesByEntity.set(operation.entityId, {});
      }
      updatesByEntity.get(operation.entityId)![operation.fieldName] =
        operation.value;
    }

    const entityIds = Array.from(updatesByEntity.keys());
    const existingEntities = await repository.findBy({
      id: In(entityIds),
    } as unknown as FindOptionsWhere<T>);

    const existingEntitiesMap = new Map(
      existingEntities.map((entity) => [entity.id, entity]),
    );

    const entityUpdateCollection = Array.from(updatesByEntity.entries()).map(
      ([entityId, updates]) => {
        const existingEntity = existingEntitiesMap.get(entityId);

        if (!existingEntity) {
          throw new Error(`Entity ${entityId} not found in existing entities`);
        }

        return {
          ...existingEntity,
          ...updates,
        };
      },
    );

    const updatedEntities = await repository.save(entityUpdateCollection);

    this.logger.log('Completed bulk updates', {
      operationsProcessed: updateOperations.length,
      entitiesUpdated: updatedEntities.length,
    });
  }
}
