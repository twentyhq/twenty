import { WorkspaceMigrationObjectFieldInput } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-object-input';

type DeletedUpdatedCreatedMatrice<T extends string> = {
  [P in `${'deleted' | 'updated' | 'created'}${Capitalize<T>}`]: WorkspaceMigrationObjectFieldInput[];
};

const updatedFieldMetadataMatriceMapDispatcher = <
  TLabel extends string,
  TEntity,
>(
  from: TEntity[],
  to: TEntity[],
): DeletedUpdatedCreatedMatrice<''> => {
  const initialDispatcher: DeletedUpdatedCreatedMatrice<''> = {
    created: [],
    deleted: [],
    updated: [],
  };
  const fromFieldsMap = new Map(
    from.fields.map((field) => [field.uniqueIdentifier, field]),
  );
  const toFielsdMap = new Map(
    to.fields.map((field) => [field.uniqueIdentifier, field]),
  );

  for (const [identifier, fromObj] of fromFieldsMap) {
    if (!toFielsdMap.has(identifier)) {
      initialDispatcher.deletedFieldMetadata.push(fromObj);
    }
  }

  for (const [identifier, toObj] of toFielsdMap) {
    if (!fromFieldsMap.has(identifier)) {
      initialDispatcher.createdFieldMetadata.push(toObj);
    }
  }

  for (const [identifier, fromObj] of fromFieldsMap) {
    const toObj = toFielsdMap.get(identifier);
    if (toObj) {
      initialDispatcher.updatedFieldMetadata.push({
        from: fromObj,
        to: toObj,
      });
    }
  }

  return initialDispatcher;
};
