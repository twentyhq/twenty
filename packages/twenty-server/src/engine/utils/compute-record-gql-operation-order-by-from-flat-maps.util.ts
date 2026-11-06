import {
  FieldMetadataType,
  type OrderBy,
  type RecordGqlOperationOrderBy,
  ViewSortDirection,
} from 'twenty-shared/types';
import {
  getOrderByForFieldMetadataType,
  getOrderByForRelationField,
  isDefined,
} from 'twenty-shared/utils';

import { type ObjectRecordOrderBy } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findManyFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { DEFAULT_LABEL_IDENTIFIER_FIELD_NAME } from 'src/engine/metadata-modules/object-metadata/constants/object-metadata.constants';

export type RecordSortToCompute = {
  fieldMetadataId: string;
  direction: `${ViewSortDirection}`;
  subFieldName?: string | null;
};

const POSITION_TIEBREAKER_ORDER_BY = [
  { position: 'AscNullsFirst' },
] satisfies RecordGqlOperationOrderBy;

const findLabelIdentifierFlatFieldMetadata = ({
  relationFlatFieldMetadata: { relationTargetObjectMetadataId },
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  relationFlatFieldMetadata: Pick<
    FlatFieldMetadata,
    'relationTargetObjectMetadataId'
  >;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): FlatFieldMetadata | undefined => {
  const targetFlatObjectMetadata = isDefined(relationTargetObjectMetadataId)
    ? findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: relationTargetObjectMetadataId,
        flatEntityMaps: flatObjectMetadataMaps,
      })
    : undefined;

  if (!isDefined(targetFlatObjectMetadata)) {
    return undefined;
  }

  return findManyFlatEntityByIdInFlatEntityMaps({
    flatEntityIds: targetFlatObjectMetadata.fieldIds,
    flatEntityMaps: flatFieldMetadataMaps,
  }).find((flatFieldMetadata) =>
    isDefined(targetFlatObjectMetadata.labelIdentifierFieldMetadataId)
      ? flatFieldMetadata.id ===
        targetFlatObjectMetadata.labelIdentifierFieldMetadataId
      : flatFieldMetadata.name === DEFAULT_LABEL_IDENTIFIER_FIELD_NAME,
  );
};

// Same order as the record table computes for these sorts, so a step sorts like the builder previews it
export const computeRecordGqlOperationOrderByFromFlatMaps = ({
  recordSorts,
  flatObjectMetadata,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  recordSorts: RecordSortToCompute[];
  flatObjectMetadata: FlatObjectMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): ObjectRecordOrderBy | undefined => {
  if (recordSorts.length === 0) {
    return undefined;
  }

  const sortsOrderBy = recordSorts.flatMap((recordSort) => {
    const flatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: recordSort.fieldMetadataId,
      flatEntityMaps: flatFieldMetadataMaps,
    });

    if (
      !isDefined(flatFieldMetadata) ||
      flatFieldMetadata.objectMetadataId !== flatObjectMetadata.id
    ) {
      throw new Error(
        `Sort references field ${recordSort.fieldMetadataId}, which does not exist on ${flatObjectMetadata.nameSingular}`,
      );
    }

    const orderByDirection: OrderBy =
      recordSort.direction === ViewSortDirection.DESC
        ? 'DescNullsLast'
        : 'AscNullsLast';

    if (flatFieldMetadata.type === FieldMetadataType.RELATION) {
      return getOrderByForRelationField({
        field: flatFieldMetadata,
        labelIdentifierField: findLabelIdentifierFlatFieldMetadata({
          relationFlatFieldMetadata: flatFieldMetadata,
          flatObjectMetadataMaps,
          flatFieldMetadataMaps,
        }),
        orderByDirection,
      });
    }

    return getOrderByForFieldMetadataType({
      field: flatFieldMetadata,
      orderByDirection,
      primaryCompositeSubField: recordSort.subFieldName,
    });
  });

  const hasPositionField = findManyFlatEntityByIdInFlatEntityMaps({
    flatEntityIds: flatObjectMetadata.fieldIds,
    flatEntityMaps: flatFieldMetadataMaps,
  }).some(
    (flatFieldMetadata) =>
      flatFieldMetadata.type === FieldMetadataType.POSITION,
  );

  return (
    !flatObjectMetadata.isRemote && hasPositionField
      ? [...sortsOrderBy, ...POSITION_TIEBREAKER_ORDER_BY]
      : sortsOrderBy
  ) as ObjectRecordOrderBy;
};
