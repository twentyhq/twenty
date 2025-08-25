import { ViewKey } from 'src/engine/core-modules/view/enums/view-key.enum';
import { ViewType } from 'src/engine/core-modules/view/enums/view-type.enum';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  type CreateViewAction,
  type WorkspaceMigrationViewActionV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-view-action-v2.type';

type BuildWorkspaceMigrationViewActionsArgs = {
  createdFlatObjectMetadatas: FlatObjectMetadata[];
};

const getCreateViewAction = (
  flatObjectMetadata: FlatObjectMetadata,
): CreateViewAction => {
  return {
    type: 'create_view',
    view: {
      objectMetadataId: flatObjectMetadata.id,
      type: ViewType.TABLE,
      name: `All {objectLabelPlural}`,
      key: ViewKey.INDEX,
      isCustom: false,
      icon: 'IconList',
      viewFields: flatObjectMetadata.flatFieldMetadatas
        .filter((field) => field.name !== 'id' && field.name !== 'deletedAt')
        .map((field, index) => ({
          fieldMetadataId: field.id,
          position: index,
          isVisible: true,
          size: 180,
        })),
    },
  };
};

export const buildWorkspaceMigrationViewActions = ({
  createdFlatObjectMetadatas,
}: BuildWorkspaceMigrationViewActionsArgs): WorkspaceMigrationViewActionV2[] => {
  return createdFlatObjectMetadatas.map(getCreateViewAction);
};
