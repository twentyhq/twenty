import {
  FieldMetadataType,
  RelationOnDeleteAction,
  RelationType,
} from 'twenty-shared/types';

import { addAllFlatEntitiesToFlatEntityMaps } from 'src/engine/core-modules/application/application-manifest/utils/__tests__/add-all-flat-entities-to-flat-entity-maps.test-util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';

const SUPPLIER_OBJECT_ID = 'supplier-object';
const GADGET_OBJECT_ID = 'gadget-object';
const SUPPLIER_OBJECT_UNIVERSAL_IDENTIFIER = 'supplier-object-uid';
const GADGET_OBJECT_UNIVERSAL_IDENTIFIER = 'gadget-object-uid';

const buildField = ({
  id,
  name,
  type,
  objectMetadataId,
  objectMetadataUniversalIdentifier,
  expression,
  currencyCodeExpression,
}: {
  id: string;
  name: string;
  type: FieldMetadataType;
  objectMetadataId: string;
  objectMetadataUniversalIdentifier: string;
  expression?: string;
  currencyCodeExpression?: string;
}) => {
  const settings =
    expression === undefined
      ? null
      : {
          formula: {
            expression,
            ...(currencyCodeExpression === undefined
              ? {}
              : { currencyCodeExpression }),
          },
        };

  return getFlatFieldMetadataMock({
    id,
    universalIdentifier: `${id}-uid`,
    name,
    type,
    objectMetadataId,
    objectMetadataUniversalIdentifier,
    settings,
    universalSettings: settings,
  });
};

const buildGadgetField = (
  field: Pick<
    Parameters<typeof buildField>[0],
    'id' | 'name' | 'type' | 'expression' | 'currencyCodeExpression'
  >,
) =>
  buildField({
    ...field,
    objectMetadataId: GADGET_OBJECT_ID,
    objectMetadataUniversalIdentifier: GADGET_OBJECT_UNIVERSAL_IDENTIFIER,
  });

const buildSupplierField = (
  field: Pick<
    Parameters<typeof buildField>[0],
    'id' | 'name' | 'type' | 'expression' | 'currencyCodeExpression'
  >,
) =>
  buildField({
    ...field,
    objectMetadataId: SUPPLIER_OBJECT_ID,
    objectMetadataUniversalIdentifier: SUPPLIER_OBJECT_UNIVERSAL_IDENTIFIER,
  });

const SUPPLIER_RELATION_SETTINGS = {
  relationType: RelationType.MANY_TO_ONE,
  onDelete: RelationOnDeleteAction.SET_NULL,
  joinColumnName: 'supplierId',
};

const SUPPLIER_FIELDS = [
  buildSupplierField({
    id: 'supplier-name',
    name: 'name',
    type: FieldMetadataType.TEXT,
  }),
  buildSupplierField({
    id: 'supplier-revenue',
    name: 'revenue',
    type: FieldMetadataType.CURRENCY,
  }),
  buildSupplierField({
    id: 'supplier-shout',
    name: 'shout',
    type: FieldMetadataType.TEXT,
    expression: 'name || "!"',
  }),
];

const GADGET_FIELDS = [
  buildGadgetField({
    id: 'gadget-price',
    name: 'price',
    type: FieldMetadataType.NUMBER,
  }),
  buildGadgetField({
    id: 'gadget-quantity',
    name: 'quantity',
    type: FieldMetadataType.NUMBER,
  }),
  getFlatFieldMetadataMock({
    id: 'gadget-supplier',
    universalIdentifier: 'gadget-supplier-uid',
    name: 'supplier',
    type: FieldMetadataType.RELATION,
    objectMetadataId: GADGET_OBJECT_ID,
    objectMetadataUniversalIdentifier: GADGET_OBJECT_UNIVERSAL_IDENTIFIER,
    relationTargetObjectMetadataId: SUPPLIER_OBJECT_ID,
    relationTargetObjectMetadataUniversalIdentifier:
      SUPPLIER_OBJECT_UNIVERSAL_IDENTIFIER,
    settings: SUPPLIER_RELATION_SETTINGS,
    universalSettings: SUPPLIER_RELATION_SETTINGS,
  }),
  buildGadgetField({
    id: 'gadget-total',
    name: 'total',
    type: FieldMetadataType.NUMBER,
    expression: 'price * quantity',
  }),
  buildGadgetField({
    id: 'gadget-supplier-label',
    name: 'supplierLabel',
    type: FieldMetadataType.TEXT,
    expression: 'supplier.name || " (" || supplier.revenue.currencyCode || ")"',
  }),
  buildGadgetField({
    id: 'gadget-commission',
    name: 'commission',
    type: FieldMetadataType.CURRENCY,
    expression: 'supplier.revenue.amountMicros * 0.1',
    currencyCodeExpression: 'supplier.revenue.currencyCode',
  }),
  buildGadgetField({
    id: 'gadget-broken',
    name: 'broken',
    type: FieldMetadataType.NUMBER,
    expression: 'missing * 2',
  }),
];

export const FORMULA_SUPPLIER_FLAT_OBJECT_METADATA_MOCK =
  getFlatObjectMetadataMock({
    id: SUPPLIER_OBJECT_ID,
    universalIdentifier: SUPPLIER_OBJECT_UNIVERSAL_IDENTIFIER,
    nameSingular: 'supplier',
    fieldIds: SUPPLIER_FIELDS.map(({ id }) => id),
    fieldUniversalIdentifiers: SUPPLIER_FIELDS.map(
      ({ universalIdentifier }) => universalIdentifier,
    ),
  });

export const FORMULA_GADGET_FLAT_OBJECT_METADATA_MOCK =
  getFlatObjectMetadataMock({
    id: GADGET_OBJECT_ID,
    universalIdentifier: GADGET_OBJECT_UNIVERSAL_IDENTIFIER,
    nameSingular: 'gadget',
    fieldIds: GADGET_FIELDS.map(({ id }) => id),
    fieldUniversalIdentifiers: GADGET_FIELDS.map(
      ({ universalIdentifier }) => universalIdentifier,
    ),
  });

export const FORMULA_FLAT_OBJECT_METADATA_MAPS_MOCK =
  addAllFlatEntitiesToFlatEntityMaps({
    flatEntities: [
      FORMULA_SUPPLIER_FLAT_OBJECT_METADATA_MOCK,
      FORMULA_GADGET_FLAT_OBJECT_METADATA_MOCK,
    ],
    flatEntityMaps: createEmptyFlatEntityMaps(),
  });

export const FORMULA_FLAT_FIELD_METADATA_MAPS_MOCK =
  addAllFlatEntitiesToFlatEntityMaps({
    flatEntities: [...SUPPLIER_FIELDS, ...GADGET_FIELDS],
    flatEntityMaps: createEmptyFlatEntityMaps(),
  });
