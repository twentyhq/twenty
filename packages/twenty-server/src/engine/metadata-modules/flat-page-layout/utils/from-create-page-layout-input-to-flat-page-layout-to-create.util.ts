import { trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import { type CreatePageLayoutInput } from 'src/engine/metadata-modules/page-layout/dtos/inputs/create-page-layout.input';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';

export type FromCreatePageLayoutInputToFlatPageLayoutToCreateArgs = {
  createPageLayoutInput: CreatePageLayoutInput;
  workspaceId: string;
  flatApplication: FlatApplication;
} & Pick<AllFlatEntityMaps, 'flatObjectMetadataMaps'>;

export const fromCreatePageLayoutInputToFlatPageLayoutToCreate = ({
  createPageLayoutInput: rawCreatePageLayoutInput,
  workspaceId,
  flatApplication,
  flatObjectMetadataMaps,
}: FromCreatePageLayoutInputToFlatPageLayoutToCreateArgs): FlatPageLayout => {
  const createPageLayoutInput =
    trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
      rawCreatePageLayoutInput,
      ['name'],
    );

  const createdAt = new Date().toISOString();
  const pageLayoutId = v4();

  const { objectMetadataUniversalIdentifier } =
    resolveEntityRelationUniversalIdentifiers({
      metadataName: 'pageLayout',
      foreignKeyValues: {
        objectMetadataId: createPageLayoutInput.objectMetadataId,
      },
      flatEntityMaps: { flatObjectMetadataMaps },
    });

  return {
    id: pageLayoutId,
    name: createPageLayoutInput.name,
    type: createPageLayoutInput.type ?? PageLayoutType.RECORD_PAGE,
    objectMetadataId: createPageLayoutInput.objectMetadataId ?? null,
    objectMetadataUniversalIdentifier,
    workspaceId,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
    universalIdentifier: pageLayoutId,
    applicationId: flatApplication.id,
    applicationUniversalIdentifier: flatApplication.universalIdentifier,
    tabIds: [],
    tabUniversalIdentifiers: [],
    defaultTabToFocusOnMobileAndSidePanelId: null,
    defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier: null,
  };
};
