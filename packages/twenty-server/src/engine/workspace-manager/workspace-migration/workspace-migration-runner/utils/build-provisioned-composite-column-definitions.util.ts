import { type FieldMetadataType } from 'twenty-shared/types';

import { PROVISIONED_COMPOSITE_PROPERTIES } from 'src/engine/metadata-modules/field-metadata/constants/provisioned-composite-properties.constant';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { type WorkspaceSchemaColumnDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-column-definition.type';
import { fieldMetadataTypeToColumnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/field-metadata-type-to-column-type.util';

export const buildProvisionedCompositeColumnDefinitions = ({
  fieldType,
  fieldName,
}: {
  fieldType: FieldMetadataType;
  fieldName: string;
}): WorkspaceSchemaColumnDefinition[] =>
  (PROVISIONED_COMPOSITE_PROPERTIES[fieldType] ?? []).map((property) => ({
    name: computeCompositeColumnName(fieldName, property),
    type: fieldMetadataTypeToColumnType(property.type),
    isNullable: true,
    isArray: false,
    default: null,
    isPrimary: false,
  }));
