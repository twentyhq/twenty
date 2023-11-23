import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';

const pipelineStepMetadata = {
  nameSingular: 'pipelineStep',
  namePlural: 'pipelineSteps',
  labelSingular: 'Pipeline Step',
  labelPlural: 'Pipeline Steps',
  targetTableName: 'pipelineStep',
  description: 'A pipeline step',
  icon: 'IconLayoutKanban',
  isActive: true,
  isSystem: true,
  fields: [
    {
      isCustom: false,
      isActive: true,
      type: FieldMetadataType.TEXT,
      name: 'name',
      label: 'Name',
      targetColumnMap: {
        value: 'name',
      },
      description: 'Pipeline Step name',
      icon: 'IconCurrencyDollar',
      isNullable: false,
      defaultValue: { value: '' },
    },
    {
      isCustom: false,
      isActive: true,
      type: FieldMetadataType.TEXT,
      name: 'color',
      label: 'Color',
      targetColumnMap: {
        value: 'color',
      },
      description: 'Pipeline Step color',
      icon: 'IconColorSwatch',
      isNullable: false,
      defaultValue: { value: '' },
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
      description: 'Pipeline Step position',
      icon: 'IconHierarchy2',
      isNullable: false,
      defaultValue: { value: 0 },
    },
    // Relations
    {
      isCustom: false,
      isActive: true,
      type: FieldMetadataType.RELATION,
      name: 'opportunities',
      label: 'Opportunities',
      targetColumnMap: {},
      description: 'Opportunities linked to the step.',
      icon: 'IconTargetArrow',
      isNullable: true,
    },
  ],
};

export default pipelineStepMetadata;
