const activityTargetMetadata = {
  nameSingular: 'activityTargetV2',
  namePlural: 'activityTargetsV2',
  labelSingular: 'Activity Target',
  labelPlural: 'Activity Targets',
  targetTableName: 'activityTarget',
  description: 'An activity target',
  icon: 'IconCheckbox',
  isActive: true,
  isSystem: true,
  fields: [
    {
      // Relations
      isCustom: false,
      isActive: true,
      type: 'RELATION',
      name: 'activity',
      label: 'Activity',
      targetColumnMap: {
        value: 'activityId',
      },
      description: 'ActivityTarget activity',
      icon: 'IconCheckbox',
      isNullable: false,
    },
    {
      isCustom: false,
      isActive: true,
      type: 'RELATION',
      name: 'person',
      label: 'Person',
      targetColumnMap: {
        value: 'personId',
      },
      description: 'ActivityTarget person',
      icon: 'IconUser',
      isNullable: true,
    },
    {
      isCustom: false,
      isActive: true,
      type: 'RELATION',
      name: 'company',
      label: 'Company',
      targetColumnMap: {
        value: 'companyId',
      },
      description: 'ActivityTarget company',
      icon: 'IconBuildingSkyscraper',
      isNullable: true,
    },
  ],
};

export default activityTargetMetadata;
