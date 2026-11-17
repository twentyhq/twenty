import { QUERY_MAX_RECORDS_FROM_RELATION } from 'twenty-shared/constants';
import {
  type FieldMetadataFilteredRelationComputation,
  FieldMetadataType,
  OrderByDirection,
  RelationType,
} from 'twenty-shared/types';
import {
  ComputedFieldExpressionError,
  hasInverseRelationField,
  isDefined,
} from 'twenty-shared/utils';

import { type ComputedFieldKindDescription } from 'src/engine/metadata-modules/computed-field/types/computed-field-kind-description.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';

const ORDER_BY_DIRECTIONS: string[] = Object.values(OrderByDirection);

export const FILTERED_RELATION_COMPUTED_FIELD_KIND_DESCRIPTION: ComputedFieldKindDescription<FieldMetadataFilteredRelationComputation> =
  {
    readableShape:
      'a filtered relation with a relation and optional filter, order and limit',
    sourceRelationProperty: 'relationFieldName',
    expressionSlots: [
      {
        property: 'filter',
        evaluatedOn: 'RELATED_RECORD',
        isRequired: false,
        valueTypes: [FieldMetadataType.BOOLEAN],
      },
      {
        property: 'orderBy',
        listItemProperty: 'expression',
        evaluatedOn: 'RELATED_RECORD',
        isRequired: false,
      },
    ],
    assertIsValidOrThrow: ({
      computation: { relationFieldName, orderBy = [], limit },
      field,
      sourceRelationField,
    }) => {
      // An inverse field belongs to one relation: the field reads through the one of the relation it derives from
      if (
        !isFlatFieldMetadataOfType(field, FieldMetadataType.RELATION) ||
        field.universalSettings.relationType !== RelationType.ONE_TO_MANY ||
        hasInverseRelationField(field) ||
        field.relationTargetObjectMetadataUniversalIdentifier !==
          sourceRelationField?.relationTargetObjectMetadataUniversalIdentifier
      ) {
        throw new ComputedFieldExpressionError(
          `A filtered relation must be a one-to-many relation without an inverse field, to the same object as "${relationFieldName}"`,
        );
      }

      if (
        orderBy.some(
          ({ direction }) => !ORDER_BY_DIRECTIONS.includes(direction),
        )
      ) {
        throw new ComputedFieldExpressionError(
          `The direction of a sort must be one of ${ORDER_BY_DIRECTIONS.join(', ')}`,
        );
      }

      if (
        isDefined(limit) &&
        (!Number.isInteger(limit) ||
          limit < 1 ||
          limit > QUERY_MAX_RECORDS_FROM_RELATION)
      ) {
        throw new ComputedFieldExpressionError(
          `The limit of a filtered relation must be between 1 and ${QUERY_MAX_RECORDS_FROM_RELATION}`,
        );
      }
    },
  };
