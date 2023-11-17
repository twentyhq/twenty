import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';

const viewFieldMetadata = {
  nameSingular: 'viewFieldV2',
  namePlural: 'viewFieldsV2',
  labelSingular: 'View Field',
  labelPlural: 'View Fields',
  targetTableName: 'viewField',
  description: '(System) View Fields',
  icon: 'IconTag',
  isActive: true,
  isSystem: true,
  fields: [
    {
      isCustom: false,
      isActive: true,
      type: FieldMetadataType.TEXT,
      name: 'fieldMetadataId',
      label: 'Field Metadata Id',
      targetColumnMap: {
        value: 'fieldMetadataId',
      },
      description: 'View Field target field',
      icon: 'IconTag',
      isNullable: false,
      defaultValue: { value: '' },
    },
    {
      isCustom: false,
      isActive: true,
      type: FieldMetadataType.BOOLEAN,
      name: 'isVisible',
      label: 'Visible',
      targetColumnMap: {
        value: 'isVisible',
      },
      description: 'View Field visibility',
      icon: 'IconEye',
      isNullable: false,
      defaultValue: { value: true },
    },
    {
      isCustom: false,
      isActive: true,
      type: FieldMetadataType.NUMBER,
      name: 'size',
      label: 'Size',
      targetColumnMap: {
        value: 'size',
      },
      description: 'View Field size',
      icon: 'IconEye',
      isNullable: false,
      defaultValue: { value: 0 },
    },
    {
      isCustom: false,
      isActive: true,
      type: FieldMetadataType.NUMBER,
      name: 'position',
      label: 'Position',
      targetColumnMap: {
        value: 'position',
      },
      description: 'View Field position',
      icon: 'IconList',
      isNullable: false,
      defaultValue: { value: 0 },
    },
    {
      isCustom: false,
      isActive: true,
      type: FieldMetadataType.RELATION,
      name: 'view',
      label: 'View',
      targetColumnMap: { value: 'viewId' },
      description: 'View Field related view',
      icon: 'IconLayoutCollage',
      isNullable: false,
    },
    // Temporary hack?
    {
      isCustom: false,
      isActive: true,
      type: FieldMetadataType.TEXT,
      name: 'viewId',
      label: 'View Id',
      targetColumnMap: {
        value: 'viewId',
      },
      description: 'View field related view',
      icon: 'IconLayoutCollage',
      isNullable: false,
    },
  ],
};

export default viewFieldMetadata;
