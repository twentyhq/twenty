import {
  OBJECT_PERMISSION_ACTIONS,
  type ObjectPermissionAction,
} from '@/application/objectPermissionActionType';
import { RecordShareAccessLevel } from '@/types/RecordShareAccessLevel';

export type GrantAccessLevel = Exclude<
  RecordShareAccessLevel,
  RecordShareAccessLevel.NONE
>;

// Same ladder as record sharing: READ reads, READ_WRITE also updates, FULL also deletes
export const OBJECT_PERMISSION_ACTIONS_BY_ACCESS_LEVEL: Record<
  GrantAccessLevel,
  ObjectPermissionAction[]
> = {
  [RecordShareAccessLevel.READ]: ['canReadObjectRecords'],
  [RecordShareAccessLevel.READ_WRITE]: [
    'canReadObjectRecords',
    'canUpdateObjectRecords',
  ],
  [RecordShareAccessLevel.FULL]: [...OBJECT_PERMISSION_ACTIONS],
};

export const GRANT_ACCESS_LEVELS: GrantAccessLevel[] = [
  RecordShareAccessLevel.READ,
  RecordShareAccessLevel.READ_WRITE,
  RecordShareAccessLevel.FULL,
];

// Undefined when the actions sit between two levels, such as update and soft delete without destroy
export const getAccessLevelFromObjectPermissionActions = (
  actions: ObjectPermissionAction[],
): GrantAccessLevel | undefined =>
  GRANT_ACCESS_LEVELS.find((accessLevel) => {
    const levelActions = OBJECT_PERMISSION_ACTIONS_BY_ACCESS_LEVEL[accessLevel];

    return (
      levelActions.length === actions.length &&
      levelActions.every((action) => actions.includes(action))
    );
  });
