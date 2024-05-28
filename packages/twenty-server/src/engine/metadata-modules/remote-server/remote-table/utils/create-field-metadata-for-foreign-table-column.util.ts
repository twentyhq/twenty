import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/field-metadata.service';
import {
  mapUdtNameToFieldType,
  mapUdtNameToFieldSettings,
} from 'src/engine/metadata-modules/remote-server/remote-table/utils/udt-name-mapper.util';
import { camelToTitleCase } from 'src/utils/camel-to-title-case';

export const createFieldMetadataForForeignTableColumn = async (
  fieldMetadataService: FieldMetadataService,
  workspaceId: string,
  columnName: string,
  columnType: string,
  objectMetadataId: string,
): Promise<FieldMetadataEntity<'default'>> => {
  return fieldMetadataService.createOne({
    name: columnName,
    label: camelToTitleCase(columnName),
    description: 'Field of remote',
    type: mapUdtNameToFieldType(columnType),
    workspaceId: workspaceId,
    objectMetadataId: objectMetadataId,
    isRemoteCreation: true,
    isNullable: true,
    icon: 'IconPlug',
    settings: mapUdtNameToFieldSettings(columnType),
  } satisfies CreateFieldInput);
};
