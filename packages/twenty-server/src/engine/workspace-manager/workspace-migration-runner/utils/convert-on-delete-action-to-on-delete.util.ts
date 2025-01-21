import { RelationOnDeleteActionV2 } from 'src/engine/metadata-modules/relation-metadata-v2/relation-metadata-v2.entity';
import { RelationOnDeleteAction } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';

export const convertOnDeleteActionToOnDelete = (
  onDeleteAction: RelationOnDeleteAction | RelationOnDeleteActionV2 | undefined,
): 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION' | undefined => {
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
