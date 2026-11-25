import { type FieldMetadataType } from 'twenty-shared/types';

import { SERVER_ONLY_COMPOSITE_COLUMNS } from 'src/engine/metadata-modules/field-metadata/constants/server-only-composite-columns.constant';
import { computeServerOnlyCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-server-only-composite-column-name.util';
import { type WorkspaceSchemaColumnDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-column-definition.type';
import { fieldMetadataTypeToColumnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/field-metadata-type-to-column-type.util';

export const buildServerOnlyCompositeColumnDefinitions = ({
  fieldType,
  fieldName,
}: {
  fieldType: FieldMetadataType;
  fieldName: string;
}): WorkspaceSchemaColumnDefinition[] =>
  (SERVER_ONLY_COMPOSITE_COLUMNS[fieldType] ?? []).map(({ name, type }) => ({
    name: computeServerOnlyCompositeColumnName({ fieldName, columnName: name }),
    type: fieldMetadataTypeToColumnType(type),
    isNullable: true,
    isArray: false,
    default: null,
    isPrimary: false,
  }));
