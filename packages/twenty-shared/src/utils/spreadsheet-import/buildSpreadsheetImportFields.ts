import { FieldMetadataType } from '@/types/FieldMetadataType';
import { RelationType } from '@/types/RelationType';
import { assertUnreachable } from '@/utils/assertUnreachable';
import { getUniqueConstraintsFields } from '@/utils/indexMetadata/getUniqueConstraintsFields';
import { COMPOSITE_FIELD_SUB_FIELD_LABELS } from '@/constants/CompositeFieldSubFieldLabels';
import { SPREADSHEET_IMPORT_COMPOSITE_SUB_FIELDS } from '@/utils/spreadsheet-import/constants/SpreadsheetImportCompositeSubFields';
import { getSpreadsheetImportCompositeSubFieldKey } from '@/utils/spreadsheet-import/getSpreadsheetImportCompositeSubFieldKey';
import { getSpreadsheetImportFieldValidationDefinitions } from '@/utils/spreadsheet-import/getSpreadsheetImportFieldValidationDefinitions';
import { getSpreadsheetImportLinksVariant } from '@/utils/spreadsheet-import/getSpreadsheetImportLinksVariant';
import { getSpreadsheetImportRelationConnectSubFieldKey } from '@/utils/spreadsheet-import/getSpreadsheetImportRelationConnectSubFieldKey';
import { getSpreadsheetImportRelationConnectSubFieldLabel } from '@/utils/spreadsheet-import/getSpreadsheetImportRelationConnectSubFieldLabel';
import {
  isSpreadsheetImportCompositeFieldType,
  type SpreadsheetImportCompositeFieldType,
} from '@/utils/spreadsheet-import/isSpreadsheetImportCompositeFieldType';
import { type SpreadsheetImportFieldDescriptor } from '@/utils/spreadsheet-import/types/SpreadsheetImportFieldDescriptor';
import { type SpreadsheetImportFieldMetadata } from '@/utils/spreadsheet-import/types/SpreadsheetImportFieldMetadata';
import { type SpreadsheetImportObjectMetadata } from '@/utils/spreadsheet-import/types/SpreadsheetImportObjectMetadata';
import { isDefined } from '@/utils/validation/isDefined';

export const buildSpreadsheetImportFields = <
  TFieldMetadata extends SpreadsheetImportFieldMetadata,
>({
  fieldMetadataItems,
  objectMetadataItems,
}: {
  fieldMetadataItems: TFieldMetadata[];
  objectMetadataItems: SpreadsheetImportObjectMetadata<TFieldMetadata>[];
}): SpreadsheetImportFieldDescriptor<TFieldMetadata>[] => {
  type FieldDescriptor = SpreadsheetImportFieldDescriptor<TFieldMetadata>;

  const createBaseField = (
    fieldMetadataItem: TFieldMetadata,
    overrides: Partial<FieldDescriptor> = {},
  ): FieldDescriptor => ({
    label: fieldMetadataItem.label,
    key: fieldMetadataItem.name,
    fieldMetadataItemId: fieldMetadataItem.id,
    fieldType: { type: 'input' },
    fieldMetadataType: fieldMetadataItem.type as FieldMetadataType,
    fieldValidationDefinitions: getSpreadsheetImportFieldValidationDefinitions(
      fieldMetadataItem.type,
      fieldMetadataItem.label,
      undefined,
      getSpreadsheetImportLinksVariant(fieldMetadataItem),
    ),
    isNestedField: false,
    ...overrides,
  });

  const buildCompositeFields = (
    fieldMetadataItem: TFieldMetadata,
    fieldType: SpreadsheetImportCompositeFieldType,
  ): FieldDescriptor[] =>
    SPREADSHEET_IMPORT_COMPOSITE_SUB_FIELDS[fieldType]
      .filter(({ isImportable }) => isImportable)
      .map(({ subFieldName }) => {
        const label = `${fieldMetadataItem.label} / ${COMPOSITE_FIELD_SUB_FIELD_LABELS[fieldType][subFieldName]}`;

        return createBaseField(fieldMetadataItem, {
          label,
          key: getSpreadsheetImportCompositeSubFieldKey(
            fieldMetadataItem,
            subFieldName,
          ),
          fieldValidationDefinitions:
            getSpreadsheetImportFieldValidationDefinitions(
              fieldMetadataItem.type,
              label,
              subFieldName,
              getSpreadsheetImportLinksVariant(fieldMetadataItem),
            ),
          isNestedField: true,
          isCompositeSubField: true,
          compositeSubFieldKey: subFieldName,
        });
      });

  const buildRelationConnectCompositeFields = (
    fieldMetadataItem: TFieldMetadata,
    uniqueConstraintField: TFieldMetadata,
    uniqueConstraintType: SpreadsheetImportCompositeFieldType,
  ): FieldDescriptor[] =>
    SPREADSHEET_IMPORT_COMPOSITE_SUB_FIELDS[uniqueConstraintType]
      .filter(
        ({ isImportable, isIncludedInUniqueConstraint }) =>
          isImportable && isIncludedInUniqueConstraint,
      )
      .map(({ subFieldName }) =>
        createBaseField(fieldMetadataItem, {
          label: getSpreadsheetImportRelationConnectSubFieldLabel(
            fieldMetadataItem,
            uniqueConstraintField,
            subFieldName,
          ),
          key: getSpreadsheetImportRelationConnectSubFieldKey(
            fieldMetadataItem,
            uniqueConstraintField,
            subFieldName,
          ),
          fieldValidationDefinitions:
            getSpreadsheetImportFieldValidationDefinitions(
              uniqueConstraintField.type,
              uniqueConstraintField.name,
              subFieldName,
              getSpreadsheetImportLinksVariant(uniqueConstraintField),
            ),
          isNestedField: true,
          isCompositeSubField: true,
          compositeSubFieldKey: subFieldName,
          uniqueFieldMetadataItem: uniqueConstraintField,
          isRelationConnectField: true,
        }),
      );

  const buildSelectField = (
    fieldMetadataItem: TFieldMetadata,
    overrides: Partial<FieldDescriptor> = {},
  ): FieldDescriptor =>
    createBaseField(fieldMetadataItem, {
      fieldType: {
        type:
          fieldMetadataItem.type === FieldMetadataType.MULTI_SELECT
            ? 'multiSelect'
            : 'select',
        options:
          fieldMetadataItem.options?.map((option) => ({
            label: option.label,
            value: option.value,
            color: option.color,
          })) ?? [],
      },
      fieldValidationDefinitions:
        getSpreadsheetImportFieldValidationDefinitions(
          fieldMetadataItem.type,
          `${fieldMetadataItem.label} (ID)`,
        ),
      ...overrides,
    });

  const buildRelationFields = (
    fieldMetadataItem: TFieldMetadata,
  ): FieldDescriptor[] => {
    const targetObjectMetadataItem = objectMetadataItems.find(
      (objectMetadataItem) =>
        objectMetadataItem.id ===
        fieldMetadataItem.relation?.targetObjectMetadata.id,
    );

    if (
      fieldMetadataItem.relation?.type !== RelationType.MANY_TO_ONE ||
      !isDefined(targetObjectMetadataItem)
    ) {
      return [];
    }

    // Composite unique indexes are flattened until they are supported here
    return getUniqueConstraintsFields<
      TFieldMetadata,
      SpreadsheetImportObjectMetadata<TFieldMetadata>
    >(targetObjectMetadataItem)
      .flat()
      .flatMap((uniqueConstraintField) =>
        isSpreadsheetImportCompositeFieldType(uniqueConstraintField.type)
          ? buildRelationConnectCompositeFields(
              fieldMetadataItem,
              uniqueConstraintField,
              uniqueConstraintField.type,
            )
          : buildField(uniqueConstraintField, {
              isNestedField: true,
              isCompositeSubField: false,
              isRelationConnectField: true,
              fieldMetadataItemId: fieldMetadataItem.id,
              fieldMetadataType: FieldMetadataType.RELATION,
              uniqueFieldMetadataItem: uniqueConstraintField,
              label: getSpreadsheetImportRelationConnectSubFieldLabel(
                fieldMetadataItem,
                uniqueConstraintField,
              ),
              key: getSpreadsheetImportRelationConnectSubFieldKey(
                fieldMetadataItem,
                uniqueConstraintField,
              ),
            }),
      );
  };

  const buildField = (
    fieldMetadataItem: TFieldMetadata,
    relationConnectFieldOverrides?: Partial<FieldDescriptor>,
  ): FieldDescriptor[] => {
    const type = fieldMetadataItem.type as FieldMetadataType;

    switch (type) {
      case FieldMetadataType.ADDRESS:
      case FieldMetadataType.CURRENCY:
      case FieldMetadataType.EMAILS:
      case FieldMetadataType.FULL_NAME:
      case FieldMetadataType.LINKS:
      case FieldMetadataType.PHONES:
      case FieldMetadataType.RICH_TEXT:
        return buildCompositeFields(fieldMetadataItem, type);
      case FieldMetadataType.RELATION:
        return buildRelationFields(fieldMetadataItem);
      case FieldMetadataType.SELECT:
      case FieldMetadataType.MULTI_SELECT:
        return [buildSelectField(fieldMetadataItem)];
      case FieldMetadataType.BOOLEAN:
        return [
          createBaseField(fieldMetadataItem, {
            fieldType: { type: 'checkbox' },
            ...relationConnectFieldOverrides,
          }),
        ];
      case FieldMetadataType.DATE_TIME:
      case FieldMetadataType.DATE:
      case FieldMetadataType.NUMBER:
      case FieldMetadataType.NUMERIC:
      case FieldMetadataType.TEXT:
      case FieldMetadataType.UUID:
      case FieldMetadataType.ARRAY:
      case FieldMetadataType.RATING:
      case FieldMetadataType.RAW_JSON:
        return [
          createBaseField(fieldMetadataItem, relationConnectFieldOverrides),
        ];
      case FieldMetadataType.FILES:
      case FieldMetadataType.POSITION:
      case FieldMetadataType.MORPH_RELATION:
      case FieldMetadataType.ACTOR:
      case FieldMetadataType.TS_VECTOR:
        return [];
      default:
        return assertUnreachable(type);
    }
  };

  return fieldMetadataItems
    .filter((field) => field.type !== FieldMetadataType.ACTOR)
    .flatMap((fieldMetadataItem) => buildField(fieldMetadataItem));
};
