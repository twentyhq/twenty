import {
  FieldMetadataType,
  RelationOnDeleteAction,
  RelationType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { addAllFlatEntitiesToFlatEntityMaps } from 'src/engine/core-modules/application/application-manifest/utils/__tests__/add-all-flat-entities-to-flat-entity-maps.test-util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { setFormulaFieldTrees } from 'src/engine/metadata-modules/formula-field/utils/set-formula-field-trees.util';
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
  const formula = isDefined(expression)
    ? {
        expression,
        ...(isDefined(currencyCodeExpression)
          ? { currencyCodeExpression }
          : {}),
      }
    : null;

  return getFlatFieldMetadataMock({
    id,
    universalIdentifier: `${id}-uid`,
    name,
    type,
    objectMetadataId,
    objectMetadataUniversalIdentifier,
    formula,
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

const GADGETS_RELATION_SETTINGS = {
  relationType: RelationType.ONE_TO_MANY,
};

const SUPPLIER_FIELDS = [
  buildSupplierField({
    id: 'supplier-name',
    name: 'name',
    type: FieldMetadataType.TEXT,
  }),
  getFlatFieldMetadataMock({
    id: 'supplier-gadgets',
    universalIdentifier: 'supplier-gadgets-uid',
    name: 'gadgets',
    type: FieldMetadataType.RELATION,
    objectMetadataId: SUPPLIER_OBJECT_ID,
    objectMetadataUniversalIdentifier: SUPPLIER_OBJECT_UNIVERSAL_IDENTIFIER,
    relationTargetObjectMetadataId: GADGET_OBJECT_ID,
    relationTargetObjectMetadataUniversalIdentifier:
      GADGET_OBJECT_UNIVERSAL_IDENTIFIER,
    relationTargetFieldMetadataId: 'gadget-supplier',
    relationTargetFieldMetadataUniversalIdentifier: 'gadget-supplier-uid',
    settings: GADGETS_RELATION_SETTINGS,
    universalSettings: GADGETS_RELATION_SETTINGS,
  }),
  buildSupplierField({
    id: 'supplier-gadget-count',
    name: 'gadgetCount',
    type: FieldMetadataType.NUMBER,
    expression: 'count(gadgets)',
  }),
  buildSupplierField({
    id: 'supplier-stock-value',
    name: 'stockValue',
    type: FieldMetadataType.NUMBER,
    expression: 'sum(gadgets.price, gadgets.quantity > 0)',
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

const FIELDS_WITHOUT_BINDINGS = [...SUPPLIER_FIELDS, ...GADGET_FIELDS];

const UNIVERSAL_FLAT_FIELD_METADATA_MAPS_WITHOUT_BINDINGS = {
  byUniversalIdentifier: Object.fromEntries(
    FIELDS_WITHOUT_BINDINGS.map((field) => [field.universalIdentifier, field]),
  ),
};

const FIELDS = FIELDS_WITHOUT_BINDINGS.map((field) =>
  setFormulaFieldTrees({
    universalFlatFieldMetadata: field,
    universalFlatObjectMetadataMaps: FORMULA_FLAT_OBJECT_METADATA_MAPS_MOCK,
    universalFlatFieldMetadataMaps:
      UNIVERSAL_FLAT_FIELD_METADATA_MAPS_WITHOUT_BINDINGS,
  }),
);

export const FORMULA_FLAT_FIELD_METADATA_MAPS_MOCK: FlatEntityMaps<FlatFieldMetadata> =
  addAllFlatEntitiesToFlatEntityMaps({
    flatEntities: FIELDS,
    flatEntityMaps: createEmptyFlatEntityMaps(),
  });
