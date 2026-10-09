import { type RelationOnDeleteAction } from 'twenty-shared/types';

import { convertOnDeleteActionToOnDelete } from 'src/engine/workspace-manager/workspace-migration/utils/convert-on-delete-action-to-on-delete.util';

// A relation created without onDelete gets a CASCADE foreign key, so an
// undefined onDelete must compare as CASCADE when deciding to rebuild it
export const computeForeignKeyOnDelete = (
  onDeleteAction: RelationOnDeleteAction | undefined,
) => convertOnDeleteActionToOnDelete(onDeleteAction) ?? 'CASCADE';
