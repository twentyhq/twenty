import { type RelationOnDeleteAction } from 'twenty-shared/types';

export const convertOnDeleteActionToOnDelete = (
  onDeleteAction: RelationOnDeleteAction | undefined,
): 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION' | undefined => {
  if (!onDeleteAction) {
    return undefined;
  }

  switch (onDeleteAction) {
    case 'CASCADE':
      return 'CASCADE';
    case 'SET_NULL':
      return 'SET NULL';
    case 'RESTRICT':
      return 'RESTRICT';
    case 'NO_ACTION':
      return 'NO ACTION';
    default:
      throw new Error('Invalid onDeleteAction');
  }
};
