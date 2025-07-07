import { FromTo } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-action-common-v2';
import { UpdateFieldAction } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-field-action-v2';
import {
  FieldMetadataEntityEditableProperties,
  WorkspaceMigrationFieldInput,
} from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-field-input';
import { WorkspaceMigrationObjectWithoutFields } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-object-input';
import { compareTwoWorkspaceMigrationFieldInput } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-v2-field-actions-builder';
import { FieldMetadataType } from 'twenty-shared/types';

type GetWorkspaceMigrationUpdateFieldActionArgs =
  FromTo<WorkspaceMigrationFieldInput> & {
    objectMetadataInput: WorkspaceMigrationObjectWithoutFields;
  };
export const compareFieldMetadataInputAndGetUpdateFieldActions = ({
  from,
  to,
  objectMetadataInput,
}: GetWorkspaceMigrationUpdateFieldActionArgs) => {
  const fieldMetadataDifferences = compareTwoWorkspaceMigrationFieldInput({
    from,
    to,
  });

  const updates = fieldMetadataDifferences.flatMap<
    UpdateFieldAction['updates'][number]
  >((difference) => {
    switch (difference.type) {
      case 'CHANGE': {
        // TODO should handle and filter on the side
        if (from.type === FieldMetadataType.RELATION) {
          return [];
        }
        const { oldValue, path, value } = difference;

        return {
          from: oldValue,
          to: value,
          property: path[0] as FieldMetadataEntityEditableProperties,
        };
      }
      case 'CREATE':
      case 'REMOVE':
      default: {
        // Should never occurs, we should only provide null never undefined and so on
        return [];
      }
    }
  });

  return {
    type: 'update_field',
    fieldMetadataInput: to,
    objectMetadataInput,
    updates,
  };
};
