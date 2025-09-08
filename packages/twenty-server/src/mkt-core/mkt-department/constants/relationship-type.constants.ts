import { TagColor } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';

// Department Hierarchy Constants
export const MAX_DEPTH = 7;

// Department Hierarchy Relationship Type Options
export const DEPARTMENT_HIERARCHY_RELATIONSHIP_TYPES = {
  PARENT_CHILD: 'PARENT_CHILD',
  MATRIX: 'MATRIX',
  FUNCTIONAL: 'FUNCTIONAL',
  TEMPORARY: 'TEMPORARY',
} as const;

export const DEPARTMENT_HIERARCHY_RELATIONSHIP_TYPE_OPTIONS = [
  {
    value: DEPARTMENT_HIERARCHY_RELATIONSHIP_TYPES.PARENT_CHILD,
    label: 'Parent-Child',
    color: 'green' as TagColor,
    position: 0,
  },
  {
    value: DEPARTMENT_HIERARCHY_RELATIONSHIP_TYPES.MATRIX,
    label: 'Matrix',
    color: 'blue' as TagColor,
    position: 1,
  },
  {
    value: DEPARTMENT_HIERARCHY_RELATIONSHIP_TYPES.FUNCTIONAL,
    label: 'Functional',
    color: 'orange' as TagColor,
    position: 2,
  },
  {
    value: DEPARTMENT_HIERARCHY_RELATIONSHIP_TYPES.TEMPORARY,
    label: 'Temporary',
    color: 'yellow' as TagColor,
    position: 3,
  },
];
