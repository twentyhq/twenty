import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';

const viewSortMetadata = {
  nameSingular: 'viewSortV2',
  namePlural: 'viewSortsV2',
  labelSingular: 'View Sort',
  labelPlural: 'View Sorts',
  targetTableName: 'viewSort',
  description: '(System) View Sorts',
  icon: 'IconArrowsSort',
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
      description: 'View Sort target field',
      icon: null,
      isNullable: false,
      defaultValue: { value: '' },
    },
    {
      isCustom: false,
      isActive: true,
      type: FieldMetadataType.TEXT,
      name: 'direction',
      label: 'Direction',
      targetColumnMap: {
        value: 'direction',
      },
      description: 'View Sort direction',
      icon: null,
      isNullable: false,
      defaultValue: { value: 'asc' },
    },
    {
      isCustom: false,
      isActive: true,
      type: FieldMetadataType.RELATION,
      name: 'view',
      label: 'View',
      targetColumnMap: {},
      description: 'View Sort related view',
      icon: 'IconLayoutCollage',
      isNullable: true,
    },
    {
      isCustom: false,
      isActive: true,
      type: FieldMetadataType.UUID,
      name: 'viewId',
      label: 'View Id',
      targetColumnMap: {
        value: 'viewId',
      },
      description: 'View Sort related view',
      icon: 'IconLayoutCollage',
      isNullable: false,
    },
  ],
};

export default viewSortMetadata;
