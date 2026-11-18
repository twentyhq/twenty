import { OrderByDirection, ViewSortDirection } from 'twenty-shared/types';
import { getOrderByForFieldMetadataType, isDefined } from 'twenty-shared/utils';

import { type ObjectRecordOrderBy } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type ViewSortDTO } from 'src/engine/metadata-modules/view-sort/dtos/view-sort.dto';

export const computeViewSortsOrderBy = ({
  viewSorts,
  flatFieldMetadataMaps,
}: {
  viewSorts: Pick<
    ViewSortDTO,
    | 'fieldMetadataId'
    | 'direction'
    | 'subFieldName'
    | 'relationTargetFieldMetadataId'
  >[];
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): ObjectRecordOrderBy =>
  viewSorts.flatMap((viewSort) => {
    const flatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: viewSort.fieldMetadataId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (!isDefined(flatFieldMetadata)) {
      return [];
    }

    const direction =
      viewSort.direction === ViewSortDirection.DESC
        ? OrderByDirection.DescNullsLast
        : OrderByDirection.AscNullsFirst;

    if (!isDefined(viewSort.relationTargetFieldMetadataId)) {
      return [{ [flatFieldMetadata.name]: direction }];
    }

    const relationTargetFlatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: viewSort.relationTargetFieldMetadataId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (!isDefined(relationTargetFlatFieldMetadata)) {
      return [];
    }

    return getOrderByForFieldMetadataType({
      field: relationTargetFlatFieldMetadata,
      orderByDirection: direction,
      primaryCompositeSubField: viewSort.subFieldName,
    }).map((relationTargetOrderBy) => ({
      [flatFieldMetadata.name]: relationTargetOrderBy,
    })) as ObjectRecordOrderBy;
  });
