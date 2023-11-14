const favoriteMetadata = {
  nameSingular: 'favoriteV2',
  namePlural: 'favoritesV2',
  labelSingular: 'Favorite',
  labelPlural: 'Favorites',
  targetTableName: 'favorite',
  description: 'A favorite',
  icon: 'IconHeart',
  isActive: true,
  isSystem: true,
  fields: [
    {
      isCustom: false,
      isActive: true,
      type: 'NUMBER',
      name: 'position',
      label: 'Position',
      targetColumnMap: {
        value: 'position',
      },
      description: 'Favorite position',
      icon: 'IconList',
      isNullable: false,
    },
    // Relations
    {
      isCustom: false,
      isActive: true,
      type: 'RELATION',
      name: 'workspaceMember',
      label: 'Workspace Member',
      targetColumnMap: {
        value: 'workspaceMemberId',
      },
      description: 'Favorite workspace member',
      icon: 'IconCircleUser',
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
      description: 'Favorite person',
      icon: 'IconUser',
      isNullable: false,
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
      description: 'Favorite company',
      icon: 'IconBuildingSkyscraper',
      isNullable: false,
    },
  ],
};

export default favoriteMetadata;
