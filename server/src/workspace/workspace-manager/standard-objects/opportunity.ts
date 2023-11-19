import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';

const opportunityMetadata = {
  nameSingular: 'opportunity',
  namePlural: 'opportunities',
  labelSingular: 'Opportunity',
  labelPlural: 'Opportunities',
  targetTableName: 'opportunity',
  description: 'An opportunity',
  icon: 'IconTargetArrow',
  isActive: true,
  isSystem: false,
  fields: [
    {
      isCustom: false,
      isActive: true,
      type: FieldMetadataType.CURRENCY,
      name: 'amount',
      label: 'Amount',
      targetColumnMap: {
        amountMicros: 'amountAmountMicros',
        currencyCode: 'amountCurrencyCode',
      },
      description: 'Opportunity amount',
      icon: 'IconCurrencyDollar',
      isNullable: true,
    },
    {
      isCustom: false,
      isActive: true,
      type: FieldMetadataType.DATE_TIME,
      name: 'closeDate',
      label: 'Close date',
      targetColumnMap: {
        value: 'closeDate',
      },
      description: 'Opportunity close date',
      icon: 'IconCalendarEvent',
      isNullable: true,
    },
    {
      isCustom: false,
      isActive: true,
      type: FieldMetadataType.TEXT,
      name: 'probability',
      label: 'Probability',
      targetColumnMap: {
        value: 'probability',
      },
      description: 'Opportunity amount',
      icon: 'IconProgressCheck',
      isNullable: true,
    },
    // Relations
    {
      isCustom: false,
      isActive: true,
      type: FieldMetadataType.RELATION,
      name: 'pipelineStep',
      label: 'Pipeline Step',
      targetColumnMap: {
        value: 'pipelineStepId',
      },
      description: 'Opportunity pipeline step',
      icon: 'IconKanban',
      isNullable: true,
    },
    {
      isCustom: false,
      isActive: true,
      type: FieldMetadataType.RELATION,
      name: 'pointOfContact',
      label: 'Point of Contact',
      targetColumnMap: {
        value: 'pointOfContactId',
      },
      description: 'Opportunity point of contact',
      icon: 'IconUser',
      isNullable: true,
    },
    {
      isCustom: false,
      isActive: true,
      type: FieldMetadataType.RELATION,
      name: 'person',
      label: 'Person',
      targetColumnMap: {
        value: 'personId',
      },
      description: 'Opportunity person',
      icon: 'IconUser',
      isNullable: true,
    },
    {
      isCustom: false,
      isActive: true,
      type: FieldMetadataType.RELATION,
      name: 'company',
      label: 'Company',
      targetColumnMap: {
        value: 'companyId',
      },
      description: 'Opportunity company',
      icon: 'IconBuildingSkyscraper',
      isNullable: true,
    },
  ],
};

export default opportunityMetadata;
