import { isDefined } from 'twenty-shared/utils';

type ViewChildRead = {
  childName: string;
  listQueryName: string;
  oneQueryName: string;
  supportsListAll: boolean;
  restPath?: string;
};

export const VIEW_CHILD_READS: ViewChildRead[] = [
  {
    childName: 'view field',
    listQueryName: 'getViewFields',
    oneQueryName: 'getViewField',
    supportsListAll: false,
    restPath: 'viewFields',
  },
  {
    childName: 'view filter',
    listQueryName: 'getViewFilters',
    oneQueryName: 'getViewFilter',
    supportsListAll: true,
    restPath: 'viewFilters',
  },
  {
    childName: 'view sort',
    listQueryName: 'getViewSorts',
    oneQueryName: 'getViewSort',
    supportsListAll: true,
    restPath: 'viewSorts',
  },
  {
    childName: 'view group',
    listQueryName: 'getViewGroups',
    oneQueryName: 'getViewGroup',
    supportsListAll: true,
    restPath: 'viewGroups',
  },
  {
    childName: 'view filter group',
    listQueryName: 'getViewFilterGroups',
    oneQueryName: 'getViewFilterGroup',
    supportsListAll: true,
    restPath: 'viewFilterGroups',
  },
  {
    childName: 'view field group',
    listQueryName: 'getViewFieldGroups',
    oneQueryName: 'getViewFieldGroup',
    supportsListAll: false,
  },
];

export const VIEW_CHILD_LIST_ALL_READS = VIEW_CHILD_READS.filter(
  ({ supportsListAll }) => supportsListAll,
);

export const VIEW_CHILD_REST_READS = VIEW_CHILD_READS.flatMap(
  ({ childName, restPath }) =>
    isDefined(restPath) ? [{ childName, restPath }] : [],
);

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
