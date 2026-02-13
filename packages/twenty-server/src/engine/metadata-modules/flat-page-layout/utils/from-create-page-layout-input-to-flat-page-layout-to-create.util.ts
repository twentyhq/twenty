import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { type CreatePageLayoutInput } from 'src/engine/metadata-modules/page-layout/dtos/inputs/create-page-layout.input';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import { type UniversalFlatPageLayout } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout.type';

export type FromCreatePageLayoutInputToFlatPageLayoutToCreateArgs = {
  createPageLayoutInput: CreatePageLayoutInput;
  flatApplication: FlatApplication;
} & Pick<AllFlatEntityMaps, 'flatObjectMetadataMaps'>;

export const fromCreatePageLayoutInputToFlatPageLayoutToCreate = ({
  createPageLayoutInput: rawCreatePageLayoutInput,
  flatApplication,
  flatObjectMetadataMaps,
}: FromCreatePageLayoutInputToFlatPageLayoutToCreateArgs): UniversalFlatPageLayout => {
  const createPageLayoutInput =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawCreatePageLayoutInput,
      ['name'],
    );

  const createdAt = new Date().toISOString();

  const { objectMetadataUniversalIdentifier } =
    resolveEntityRelationUniversalIdentifiers({
      metadataName: 'pageLayout',
      foreignKeyValues: {
        objectMetadataId: createPageLayoutInput.objectMetadataId,
      },
      flatEntityMaps: { flatObjectMetadataMaps },
    });

  return {
    name: createPageLayoutInput.name,
    type: createPageLayoutInput.type ?? PageLayoutType.RECORD_PAGE,
    objectMetadataUniversalIdentifier,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    universalIdentifier: v4(),
    applicationUniversalIdentifier: flatApplication.universalIdentifier,
    tabUniversalIdentifiers: [],
    defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier: null,
  };
};
