import {
  type ConditionalAvailabilityNode,
  RecordFilterOperand,
} from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { validateFieldMetadataNotUsedByConditionalAvailabilityCrossEntity } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-field-metadata-not-used-by-conditional-availability-cross-entity.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

const COMPANY_OBJECT_UNIVERSAL_IDENTIFIER = 'company-object';
const STAGE_FIELD_UNIVERSAL_IDENTIFIER = '20202020-6f76-477d-8551-28cd65b2b4b9';
const OTHER_FIELD_UNIVERSAL_IDENTIFIER = '20202020-583e-4642-8533-db761d5fa82f';
const AUTHOR_APPLICATION_UNIVERSAL_IDENTIFIER = 'author-application';

const buildRule = (
  fieldMetadataUniversalIdentifier: string,
): ConditionalAvailabilityNode => ({
  type: 'GROUP',
  logicalOperator: 'AND',
  children: [
    { type: 'PATH', path: 'device' },
    {
      type: 'SELECTED_RECORDS',
      quantifier: 'EVERY',
      recordFilter: {
        fieldMetadataUniversalIdentifier,
        subFieldName: null,
        operand: RecordFilterOperand.IS_NOT_EMPTY,
        value: '',
      },
    },
  ],
});

const STAGE_RULE = buildRule(STAGE_FIELD_UNIVERSAL_IDENTIFIER);

const buildWidgetMaps = (widgets: object[]) =>
  ({
    ...createEmptyFlatEntityMaps(),
    byUniversalIdentifier: Object.fromEntries(
      widgets.map((widget, index) => [`widget-${index}`, widget]),
    ),
  }) as never;

const validate = ({
  widgets = [],
  deletedObjectUniversalIdentifiers = [],
}: {
  widgets?: object[];
  deletedObjectUniversalIdentifiers?: string[];
}) =>
  validateFieldMetadataNotUsedByConditionalAvailabilityCrossEntity({
    fromFlatFieldMetadataMaps: {
      ...createEmptyFlatEntityMaps(),
      byUniversalIdentifier: {
        [STAGE_FIELD_UNIVERSAL_IDENTIFIER]: {
          universalIdentifier: STAGE_FIELD_UNIVERSAL_IDENTIFIER,
          name: 'stage',
          objectMetadataUniversalIdentifier:
            COMPANY_OBJECT_UNIVERSAL_IDENTIFIER,
        } as unknown as UniversalFlatFieldMetadata,
      },
    },
    optimisticUniversalFlatMaps: {
      flatPageLayoutWidgetMaps: buildWidgetMaps(widgets),
    },
    orchestratorActionsReport: {
      fieldMetadata: {
        delete: [{ universalIdentifier: STAGE_FIELD_UNIVERSAL_IDENTIFIER }],
      },
      objectMetadata: {
        delete: deletedObjectUniversalIdentifiers.map(
          (universalIdentifier) => ({ universalIdentifier }),
        ),
      },
    } as never,
  });

describe('validateFieldMetadataNotUsedByConditionalAvailabilityCrossEntity', () => {
  it.each<{ title: string; widget: object }>([
    {
      title: 'a widget rule',
      widget: { conditionalAvailability: STAGE_RULE },
    },
    {
      title: 'a widget rule written by another application',
      widget: {
        conditionalAvailability: null,
        universalOverrides: {
          [AUTHOR_APPLICATION_UNIVERSAL_IDENTIFIER]: {
            conditionalAvailability: STAGE_RULE,
          },
        },
      },
    },
  ])('should refuse to delete a field used by $title', ({ widget }) => {
    const { fieldMetadata } = validate({ widgets: [widget] });

    expect(fieldMetadata).toHaveLength(1);
    expect(fieldMetadata[0]).toMatchObject({
      type: 'delete',
      flatEntityMinimalInformation: {
        universalIdentifier: STAGE_FIELD_UNIVERSAL_IDENTIFIER,
        name: 'stage',
      },
      errors: [
        {
          code: FieldMetadataExceptionCode.FIELD_MUTATION_NOT_ALLOWED,
          message: 'Field stage is used by 1 visibility rule(s)',
        },
      ],
    });
  });

  it('should count every rule that uses the field', () => {
    const { fieldMetadata } = validate({
      widgets: [
        { conditionalAvailability: STAGE_RULE },
        {
          conditionalAvailability: STAGE_RULE,
          universalOverrides: {
            [AUTHOR_APPLICATION_UNIVERSAL_IDENTIFIER]: {
              conditionalAvailability: STAGE_RULE,
            },
          },
        },
      ],
    });

    expect(fieldMetadata[0]?.errors[0]?.message).toBe(
      'Field stage is used by 3 visibility rule(s)',
    );
  });

  it('should let a field go when no rule uses it', () => {
    expect(
      validate({
        widgets: [
          {
            conditionalAvailability: buildRule(
              OTHER_FIELD_UNIVERSAL_IDENTIFIER,
            ),
          },
          { conditionalAvailability: { type: 'PATH', path: 'device' } },
        ],
      }).fieldMetadata,
    ).toEqual([]);
  });

  it('should let a field go together with its object', () => {
    expect(
      validate({
        widgets: [{ conditionalAvailability: STAGE_RULE }],
        deletedObjectUniversalIdentifiers: [
          COMPANY_OBJECT_UNIVERSAL_IDENTIFIER,
        ],
      }).fieldMetadata,
    ).toEqual([]);
  });
});
