export const VIEW_CHILD_READS = [
  {
    childName: 'view field',
    listQueryName: 'getViewFields',
    oneQueryName: 'getViewField',
  },
  {
    childName: 'view filter',
    listQueryName: 'getViewFilters',
    oneQueryName: 'getViewFilter',
  },
  {
    childName: 'view sort',
    listQueryName: 'getViewSorts',
    oneQueryName: 'getViewSort',
  },
  {
    childName: 'view group',
    listQueryName: 'getViewGroups',
    oneQueryName: 'getViewGroup',
  },
  {
    childName: 'view filter group',
    listQueryName: 'getViewFilterGroups',
    oneQueryName: 'getViewFilterGroup',
  },
  {
    childName: 'view field group',
    listQueryName: 'getViewFieldGroups',
    oneQueryName: 'getViewFieldGroup',
  },
];

export const VIEW_CHILD_LIST_ALL_READS = [
  { childName: 'view filter', listQueryName: 'getViewFilters' },
  { childName: 'view sort', listQueryName: 'getViewSorts' },
  { childName: 'view group', listQueryName: 'getViewGroups' },
  { childName: 'view filter group', listQueryName: 'getViewFilterGroups' },
];

export const VIEW_CHILD_REST_READS = [
  { childName: 'view field', restPath: 'viewFields' },
  { childName: 'view filter', restPath: 'viewFilters' },
  { childName: 'view sort', restPath: 'viewSorts' },
  { childName: 'view group', restPath: 'viewGroups' },
  { childName: 'view filter group', restPath: 'viewFilterGroups' },
];

export const VIEW_CHILD_RELATION_NAMES = [
  'viewFields',
  'viewFilters',
  'viewSorts',
  'viewGroups',
  'viewFilterGroups',
  'viewFieldGroups',
];

export const VIEW_WITH_CHILD_IDS_GQL_FIELDS = `
  id
  viewFields { id }
  viewFilters { id }
  viewSorts { id }
  viewGroups { id }
  viewFilterGroups { id }
  viewFieldGroups { id }
`;
