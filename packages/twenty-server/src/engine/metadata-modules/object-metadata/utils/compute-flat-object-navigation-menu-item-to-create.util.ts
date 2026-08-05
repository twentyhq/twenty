import { getObjectNavigationMenuItemUniversalIdentifier } from 'twenty-shared/application';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { type UniversalFlatNavigationMenuItem } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-navigation-menu-item.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';

export const computeFlatObjectNavigationMenuItemToCreate = ({
  objectMetadata,
  applicationUniversalIdentifier,
  position,
}: {
  applicationUniversalIdentifier: string;
  objectMetadata: Pick<UniversalFlatObjectMetadata, 'universalIdentifier'>;
  position: number;
}): UniversalFlatNavigationMenuItem & { id: string } => {
  const createdAt = new Date().toISOString();

  return {
    id: v4(),
    universalIdentifier: getObjectNavigationMenuItemUniversalIdentifier({
      applicationUniversalIdentifier,
      objectUniversalIdentifier: objectMetadata.universalIdentifier,
    }),
    applicationUniversalIdentifier,
    type: NavigationMenuItemType.OBJECT,
    targetObjectMetadataUniversalIdentifier: objectMetadata.universalIdentifier,
    userWorkspaceId: null,
    targetRecordId: null,
    viewUniversalIdentifier: null,
    folderUniversalIdentifier: null,
    pageLayoutUniversalIdentifier: null,
    name: null,
    link: null,
    icon: null,
    color: null,
    position,
    isSystemSideEffect: true,
    createdAt,
    updatedAt: createdAt,
  };
};
