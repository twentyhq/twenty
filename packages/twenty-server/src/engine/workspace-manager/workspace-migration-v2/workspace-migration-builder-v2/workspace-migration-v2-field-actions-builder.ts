import diff from 'microdiff';
import {
  CreateFieldAction,
  DeleteFieldAction,
  FromTo,
  WorkspaceMigrationFieldActionV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-action-v2';
import { WorkspaceMigrationObjectFieldInput } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-object-input';
import { UniqueIdentifierWorkspaceMigrationObjectInputMapDispatcher } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-builder-v2.service';
import { transformMetadataForComparison } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/utils/transform-metadata-for-comparison.util';
import { FieldMetadataType } from 'twenty-shared/types';

const commonFieldPropertiesToIgnore = [
  'id',
  'createdAt',
  'updatedAt',
  'objectMetadataId',
  'isActive',
  'options',
  'settings',
  'joinColumn',
  'gate',
  'asExpression',
  'generatedType',
  'isLabelSyncedWithName',
  // uniqueIdentifier
];

const shouldNotOverrideDefaultValue = (type: FieldMetadataType) => {
  return [
    FieldMetadataType.BOOLEAN,
    FieldMetadataType.SELECT,
    FieldMetadataType.MULTI_SELECT,
    FieldMetadataType.CURRENCY,
    FieldMetadataType.PHONES,
    FieldMetadataType.ADDRESS,
  ].includes(type);
};

const fieldPropertiesToStringify = ['defaultValue'] as const;

export const compareTwoWorkspaceMigrationFieldInput = ({
  from,
  to,
}: FromTo<WorkspaceMigrationObjectFieldInput>) => {
  const compareFieldMetadataOptions = {
    shouldIgnoreProperty: (
      property: string,
      fieldMetadata: WorkspaceMigrationObjectFieldInput,
    ) => {
      if (
        property === 'defaultValue' &&
        shouldNotOverrideDefaultValue(fieldMetadata.type)
      ) {
        return true;
      }

      if (commonFieldPropertiesToIgnore.includes(property)) {
        return true;
      }

      return false;
    },
    propertiesToStringify: fieldPropertiesToStringify,
  };
  const fromCompare = transformMetadataForComparison(
    from,
    compareFieldMetadataOptions,
  );
  const toCompare = transformMetadataForComparison(
    to,
    compareFieldMetadataOptions,
  );

  const fieldMetadataDifference = diff(fromCompare, toCompare);
  return fieldMetadataDifference;
};

type BuildWorkspaceMigrationV2FieldActionFromUpdatedFieldMetadataArgs =
  FromTo<WorkspaceMigrationObjectFieldInput> & {
    objectMetadataUniqueIdentifier: string;
  };
const buildWorkspaceMigrationV2FieldActionFromUpdatedFieldMetadata = ({
  objectMetadataUniqueIdentifier,
  from,
  to,
}: BuildWorkspaceMigrationV2FieldActionFromUpdatedFieldMetadataArgs) => {
  const fieldMetadataDifferences = compareTwoWorkspaceMigrationFieldInput({
    from,
    to,
  });
  return fieldMetadataDifferences.flatMap<WorkspaceMigrationFieldActionV2>(
    (difference) => {
      switch (difference.type) {
        case 'CREATE': {
          return {
            field: difference.value,
            fieldUniqueIdentifier: 'TODO',
            objectUniqueIdentifier: objectMetadataUniqueIdentifier,
            type: 'create_field',
          };
        }
        case 'CHANGE': {
          // TODO prastoin
          return [];
        }
        case 'REMOVE': {
          return {
            fieldUniqueIdentifier: difference.oldValue.uniqueIdentifier,
            objectUniqueIdentifier: objectMetadataUniqueIdentifier,
            type: 'delete_field',
          };
        }
        default: {
          return [];
        }
      }
    },
  );
};

type FieldInputOperationMatrix = {
  objectMetadataUniqueIdentifier: string;
  deletedFieldMetadata: WorkspaceMigrationObjectFieldInput[];
  createdFieldMetadata: WorkspaceMigrationObjectFieldInput[];
  updatedFieldMetadata: FromTo<WorkspaceMigrationObjectFieldInput>[];
};

const updatedFieldMetadataMatriceMapDispatcher = (
  updatedObjectMetadata: UniqueIdentifierWorkspaceMigrationObjectInputMapDispatcher['updatedObjectMetadata'],
): FieldInputOperationMatrix[] => {
  const matriceAccumulator: FieldInputOperationMatrix[] = [];

  for (const { from, to } of updatedObjectMetadata) {
    const initialDispatcher: FieldInputOperationMatrix = {
      createdFieldMetadata: [],
      deletedFieldMetadata: [],
      updatedFieldMetadata: [],
      objectMetadataUniqueIdentifier: from.uniqueIdentifier,
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
  }

  return matriceAccumulator;
};

// Should return WorkspaceObjectMigrationV2 ?
export const buildWorkspaceMigrationV2FieldActions = (
  updatedObjectMetadata: UniqueIdentifierWorkspaceMigrationObjectInputMapDispatcher['updatedObjectMetadata'],
): WorkspaceMigrationFieldActionV2[] => {
  const fieldMatrix = updatedFieldMetadataMatriceMapDispatcher(
    updatedObjectMetadata,
  );

  const allUpdatedObjectMetadataFieldAction: WorkspaceMigrationFieldActionV2[] =
    [];
  for (const {
    createdFieldMetadata,
    deletedFieldMetadata,
    objectMetadataUniqueIdentifier,
    updatedFieldMetadata,
  } of fieldMatrix) {
    const updateFieldAction =
      updatedFieldMetadata.flatMap<WorkspaceMigrationFieldActionV2>(
        ({ from, to }) =>
          buildWorkspaceMigrationV2FieldActionFromUpdatedFieldMetadata({
            from,
            to,
            objectMetadataUniqueIdentifier: objectMetadataUniqueIdentifier,
          }),
      );

    const createFieldAction = createdFieldMetadata.map<CreateFieldAction>(
      (field) => ({
        field: field as any, // TODO
        fieldUniqueIdentifier: field.uniqueIdentifier,
        objectUniqueIdentifier: objectMetadataUniqueIdentifier,
        type: 'create_field',
      }),
    );

    const deletedFieldAction = deletedFieldMetadata.map<DeleteFieldAction>(
      (field) => ({
        field: field as any, // TODO
        fieldUniqueIdentifier: field.uniqueIdentifier,
        objectUniqueIdentifier: objectMetadataUniqueIdentifier,
        type: 'delete_field',
      }),
    );

    allUpdatedObjectMetadataFieldAction.concat([
      ...createFieldAction,
      ...deletedFieldAction,
      ...updateFieldAction,
    ]);
  }

  return allUpdatedObjectMetadataFieldAction;
};
