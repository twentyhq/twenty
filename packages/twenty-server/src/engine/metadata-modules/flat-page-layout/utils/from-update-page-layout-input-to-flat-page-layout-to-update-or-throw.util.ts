import { t } from '@lingui/core/macro';
import {
  extractAndSanitizeObjectStringFields,
  isDefined,
} from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { FLAT_PAGE_LAYOUT_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-page-layout/constants/flat-page-layout-editable-properties.constant';
import { type FlatPageLayoutMaps } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout-maps.type';
import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import { type UpdatePageLayoutInput } from 'src/engine/metadata-modules/page-layout/dtos/inputs/update-page-layout.input';
import {
  PageLayoutException,
  PageLayoutExceptionCode,
} from 'src/engine/metadata-modules/page-layout/exceptions/page-layout.exception';
import { mergeUpdateInExistingRecord } from 'src/utils/merge-update-in-existing-record.util';

export type UpdatePageLayoutInputWithId = {
  id: string;
  update: UpdatePageLayoutInput;
};

export const fromUpdatePageLayoutInputToFlatPageLayoutToUpdateOrThrow = ({
  updatePageLayoutInput: rawUpdatePageLayoutInput,
  flatPageLayoutMaps,
  flatObjectMetadataMaps,
}: {
  updatePageLayoutInput: UpdatePageLayoutInputWithId;
  flatPageLayoutMaps: FlatPageLayoutMaps;
} & Pick<AllFlatEntityMaps, 'flatObjectMetadataMaps'>): FlatPageLayout => {
  const { id: pageLayoutToUpdateId } = extractAndSanitizeObjectStringFields(
    rawUpdatePageLayoutInput,
    ['id'],
  );

  const existingFlatPageLayoutToUpdate = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: pageLayoutToUpdateId,
    flatEntityMaps: flatPageLayoutMaps,
  });

  if (!isDefined(existingFlatPageLayoutToUpdate)) {
    throw new PageLayoutException(
      t`Page layout to update not found`,
      PageLayoutExceptionCode.PAGE_LAYOUT_NOT_FOUND,
    );
  }

  const updatedEditableFieldProperties = extractAndSanitizeObjectStringFields(
    rawUpdatePageLayoutInput.update,
    FLAT_PAGE_LAYOUT_EDITABLE_PROPERTIES,
  );

  const flatPageLayoutToUpdate = mergeUpdateInExistingRecord({
    existing: existingFlatPageLayoutToUpdate,
    properties: FLAT_PAGE_LAYOUT_EDITABLE_PROPERTIES,
    update: updatedEditableFieldProperties,
  });

  if (updatedEditableFieldProperties.objectMetadataId !== undefined) {
    const { objectMetadataUniversalIdentifier } =
      resolveEntityRelationUniversalIdentifiers({
        metadataName: 'pageLayout',
        foreignKeyValues: {
          objectMetadataId: flatPageLayoutToUpdate.objectMetadataId,
        },
        flatEntityMaps: { flatObjectMetadataMaps },
      });

    flatPageLayoutToUpdate.objectMetadataUniversalIdentifier =
      objectMetadataUniversalIdentifier;
  }

  return flatPageLayoutToUpdate;
};
