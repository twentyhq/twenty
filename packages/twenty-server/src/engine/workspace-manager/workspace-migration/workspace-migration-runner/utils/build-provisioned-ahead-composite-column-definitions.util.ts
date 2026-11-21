import { type FieldMetadataType } from 'twenty-shared/types';

import { COMPOSITE_PROPERTIES_PROVISIONED_AHEAD_OF_RUNTIME } from 'src/engine/metadata-modules/field-metadata/constants/composite-properties-provisioned-ahead-of-runtime.constant';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { type WorkspaceSchemaColumnDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-column-definition.type';
import { fieldMetadataTypeToColumnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/field-metadata-type-to-column-type.util';

export const buildProvisionedAheadCompositeColumnDefinitions = ({
  fieldType,
  fieldName,
}: {
  fieldType: FieldMetadataType;
  fieldName: string;
}): WorkspaceSchemaColumnDefinition[] =>
  (COMPOSITE_PROPERTIES_PROVISIONED_AHEAD_OF_RUNTIME[fieldType] ?? []).map(
    (compositeProperty) => ({
      name: computeCompositeColumnName(fieldName, compositeProperty),
      type: fieldMetadataTypeToColumnType(compositeProperty.type),
      isNullable: true,
      isArray: false,
      default: null,
      isPrimary: false,
    }),
  );
