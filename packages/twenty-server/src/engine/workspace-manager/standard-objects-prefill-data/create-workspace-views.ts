import { EntityManager } from 'typeorm';
import { v4 } from 'uuid';

import { ViewDefinition } from 'src/engine/workspace-manager/standard-objects-prefill-data/types/view-definition.interface';

export const createWorkspaceViews = async (
  entityManager: EntityManager,
  schemaName: string,
  viewDefinitions: ViewDefinition[],
) => {
  const viewDefinitionsWithId = viewDefinitions.map((viewDefinition) => ({
    ...viewDefinition,
    id: v4(),
  }));

  await entityManager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.view`, [
      'id',
      'name',
      'objectMetadataId',
      'type',
      'key',
      'position',
      'icon',
      'kanbanFieldMetadataId',
      'kanbanAggregateOperation',
      'kanbanAggregateOperationFieldMetadataId',
    ])
    .values(
      viewDefinitionsWithId.map(
        ({
          id,
          name,
          objectMetadataId,
          type,
          key,
          position,
          icon,
          kanbanFieldMetadataId,
          kanbanAggregateOperation,
          kanbanAggregateOperationFieldMetadataId,
        }) => ({
          id,
          name,
          objectMetadataId,
          type,
          key,
          position,
          icon,
          kanbanFieldMetadataId,
          kanbanAggregateOperation,
          kanbanAggregateOperationFieldMetadataId,
        }),
      ),
    )
    .returning('*')
    .execute();

  for (const viewDefinition of viewDefinitionsWithId) {
    if (viewDefinition.fields && viewDefinition.fields.length > 0) {
      await entityManager
        .createQueryBuilder()
        .insert()
        .into(`${schemaName}.viewField`, [
          'fieldMetadataId',
          'position',
          'isVisible',
          'size',
          'viewId',
          'aggregateOperation',
        ])
        .values(
          viewDefinition.fields.map((field) => ({
            fieldMetadataId: field.fieldMetadataId,
            position: field.position,
            isVisible: field.isVisible,
            size: field.size,
            viewId: viewDefinition.id,
            aggregateOperation: field.aggregateOperation,
          })),
        )
        .execute();
    }

    if (viewDefinition.filters && viewDefinition.filters.length > 0) {
      await entityManager
        .createQueryBuilder()
        .insert()
        .into(`${schemaName}.viewFilter`, [
          'fieldMetadataId',
          'displayValue',
          'operand',
          'value',
          'viewId',
        ])
        .values(
          viewDefinition.filters.map((filter: any) => ({
            fieldMetadataId: filter.fieldMetadataId,
            displayValue: filter.displayValue,
            operand: filter.operand,
            value: filter.value,
            viewId: viewDefinition.id,
          })),
        )
        .execute();
    }

    if (
      'groups' in viewDefinition &&
      viewDefinition.groups &&
      viewDefinition.groups.length > 0
    ) {
      await entityManager
        .createQueryBuilder()
        .insert()
        .into(`${schemaName}.viewGroup`, [
          'fieldMetadataId',
          'isVisible',
          'fieldValue',
          'position',
          'viewId',
        ])
        .values(
          viewDefinition.groups.map((group: any) => ({
            fieldMetadataId: group.fieldMetadataId,
            isVisible: group.isVisible,
            fieldValue: group.fieldValue,
            position: group.position,
            viewId: viewDefinition.id,
          })),
        )
        .execute();
    }
  }

  return viewDefinitionsWithId;
};
