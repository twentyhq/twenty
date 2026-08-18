import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { FieldDisplayMode } from 'src/engine/metadata-modules/page-layout-widget/enums/field-display-mode.enum';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { type AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';
import { validateFieldConfigurationNestedRelationOrThrow } from 'src/engine/metadata-modules/page-layout-widget/utils/validate-field-configuration-nested-relation.util';

const COMPANY_OBJECT_ID = 'company-object-id';
const PERSON_OBJECT_ID = 'person-object-id';
const OPPORTUNITY_OBJECT_ID = 'opportunity-object-id';

const PEOPLE_FIELD_ID = 'company-people-field-id';
const OWNED_OPPORTUNITIES_FIELD_ID = 'person-owned-opportunities-field-id';
const PERSON_COMPANY_FIELD_ID = 'person-company-field-id';
const COMPANY_NAME_FIELD_ID = 'company-name-field-id';

const peopleField = getFlatFieldMetadataMock({
  id: PEOPLE_FIELD_ID,
  universalIdentifier: 'company-people-field-ui',
  objectMetadataId: COMPANY_OBJECT_ID,
  type: FieldMetadataType.RELATION,
  name: 'people',
  label: 'People',
  settings: { relationType: RelationType.ONE_TO_MANY },
  relationTargetObjectMetadataId: PERSON_OBJECT_ID,
});

const ownedOpportunitiesField = getFlatFieldMetadataMock({
  id: OWNED_OPPORTUNITIES_FIELD_ID,
  universalIdentifier: 'person-owned-opportunities-field-ui',
  objectMetadataId: PERSON_OBJECT_ID,
  type: FieldMetadataType.RELATION,
  name: 'ownedOpportunities',
  label: 'Owned opportunities',
  settings: { relationType: RelationType.ONE_TO_MANY },
  relationTargetObjectMetadataId: OPPORTUNITY_OBJECT_ID,
});

const personCompanyField = getFlatFieldMetadataMock({
  id: PERSON_COMPANY_FIELD_ID,
  universalIdentifier: 'person-company-field-ui',
  objectMetadataId: PERSON_OBJECT_ID,
  type: FieldMetadataType.RELATION,
  name: 'company',
  label: 'Company',
  settings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'companyId',
  },
  relationTargetObjectMetadataId: COMPANY_OBJECT_ID,
});

const companyNameField = getFlatFieldMetadataMock({
  id: COMPANY_NAME_FIELD_ID,
  universalIdentifier: 'company-name-field-ui',
  objectMetadataId: COMPANY_OBJECT_ID,
  type: FieldMetadataType.TEXT,
  name: 'name',
  label: 'Name',
  settings: null,
});

const buildFlatFieldMetadataMaps = (
  fields: FlatFieldMetadata[],
): FlatEntityMaps<FlatFieldMetadata> => ({
  byUniversalIdentifier: Object.fromEntries(
    fields.map((field) => [field.universalIdentifier, field]),
  ),
  universalIdentifierById: Object.fromEntries(
    fields.map((field) => [field.id, field.universalIdentifier]),
  ),
  universalIdentifiersByApplicationId: {},
});

const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([
  peopleField,
  ownedOpportunitiesField,
  personCompanyField,
  companyNameField,
]);

const buildFieldConfiguration = (
  overrides: Partial<{
    fieldMetadataId: string;
    nestedRelationFieldMetadataId: string | null;
    fieldDisplayMode: FieldDisplayMode;
  }> = {},
): AllPageLayoutWidgetConfiguration =>
  ({
    configurationType: WidgetConfigurationType.FIELD,
    fieldMetadataId: PEOPLE_FIELD_ID,
    fieldDisplayMode: FieldDisplayMode.TABLE,
    nestedRelationFieldMetadataId: OWNED_OPPORTUNITIES_FIELD_ID,
    ...overrides,
  }) as AllPageLayoutWidgetConfiguration;

describe('validateFieldConfigurationNestedRelationOrThrow', () => {
  it('should pass for a valid one-to-many chain', () => {
    expect(() =>
      validateFieldConfigurationNestedRelationOrThrow({
        widgetConfiguration: buildFieldConfiguration(),
        widgetObjectMetadataId: COMPANY_OBJECT_ID,
        flatFieldMetadataMaps,
      }),
    ).not.toThrow();
  });

  it('should ignore non-FIELD configurations', () => {
    expect(() =>
      validateFieldConfigurationNestedRelationOrThrow({
        widgetConfiguration: {
          configurationType: WidgetConfigurationType.IFRAME,
        } as AllPageLayoutWidgetConfiguration,
        widgetObjectMetadataId: COMPANY_OBJECT_ID,
        flatFieldMetadataMaps,
      }),
    ).not.toThrow();
  });

  it('should ignore FIELD configurations without a nested relation', () => {
    expect(() =>
      validateFieldConfigurationNestedRelationOrThrow({
        widgetConfiguration: buildFieldConfiguration({
          nestedRelationFieldMetadataId: null,
        }),
        widgetObjectMetadataId: COMPANY_OBJECT_ID,
        flatFieldMetadataMaps,
      }),
    ).not.toThrow();
  });

  it('should throw when a nested relation is combined with an inline display mode', () => {
    expect(() =>
      validateFieldConfigurationNestedRelationOrThrow({
        widgetConfiguration: buildFieldConfiguration({
          fieldDisplayMode: FieldDisplayMode.FIELD,
        }),
        widgetObjectMetadataId: COMPANY_OBJECT_ID,
        flatFieldMetadataMaps,
      }),
    ).toThrow(/fieldDisplayMode/);
  });

  it('should throw when the source field does not exist', () => {
    expect(() =>
      validateFieldConfigurationNestedRelationOrThrow({
        widgetConfiguration: buildFieldConfiguration({
          fieldMetadataId: 'unknown-field-id',
        }),
        widgetObjectMetadataId: COMPANY_OBJECT_ID,
        flatFieldMetadataMaps,
      }),
    ).toThrow(/not found/);
  });

  it('should pass for a valid many-to-one first hop chain', () => {
    expect(() =>
      validateFieldConfigurationNestedRelationOrThrow({
        widgetConfiguration: buildFieldConfiguration({
          fieldMetadataId: PERSON_COMPANY_FIELD_ID,
          nestedRelationFieldMetadataId: PEOPLE_FIELD_ID,
        }),
        widgetObjectMetadataId: PERSON_OBJECT_ID,
        flatFieldMetadataMaps,
      }),
    ).not.toThrow();
  });

  it('should throw when the source field is not a relation', () => {
    expect(() =>
      validateFieldConfigurationNestedRelationOrThrow({
        widgetConfiguration: buildFieldConfiguration({
          fieldMetadataId: COMPANY_NAME_FIELD_ID,
        }),
        widgetObjectMetadataId: COMPANY_OBJECT_ID,
        flatFieldMetadataMaps,
      }),
    ).toThrow(/one-to-many or many-to-one/);
  });

  it('should throw when the source field belongs to another object', () => {
    expect(() =>
      validateFieldConfigurationNestedRelationOrThrow({
        widgetConfiguration: buildFieldConfiguration(),
        widgetObjectMetadataId: PERSON_OBJECT_ID,
        flatFieldMetadataMaps,
      }),
    ).toThrow(/does not belong to the widget object/);
  });

  it('should throw when the nested field does not exist', () => {
    expect(() =>
      validateFieldConfigurationNestedRelationOrThrow({
        widgetConfiguration: buildFieldConfiguration({
          nestedRelationFieldMetadataId: 'unknown-nested-field-id',
        }),
        widgetObjectMetadataId: COMPANY_OBJECT_ID,
        flatFieldMetadataMaps,
      }),
    ).toThrow(/not found/);
  });

  it('should throw when the nested field is not a one-to-many relation', () => {
    expect(() =>
      validateFieldConfigurationNestedRelationOrThrow({
        widgetConfiguration: buildFieldConfiguration({
          nestedRelationFieldMetadataId: PERSON_COMPANY_FIELD_ID,
        }),
        widgetObjectMetadataId: COMPANY_OBJECT_ID,
        flatFieldMetadataMaps,
      }),
    ).toThrow(/one-to-many/);
  });

  it('should throw when the source field is a junction many-to-one relation', () => {
    const junctionSourceField = getFlatFieldMetadataMock({
      id: 'company-junction-source-field-id',
      universalIdentifier: 'company-junction-source-field-ui',
      objectMetadataId: COMPANY_OBJECT_ID,
      type: FieldMetadataType.RELATION,
      name: 'primaryAgreement',
      label: 'Primary agreement',
      settings: {
        relationType: RelationType.MANY_TO_ONE,
        junctionTargetFieldId: 'junction-target-field-id',
      },
      relationTargetObjectMetadataId: PERSON_OBJECT_ID,
    });

    expect(() =>
      validateFieldConfigurationNestedRelationOrThrow({
        widgetConfiguration: buildFieldConfiguration({
          fieldMetadataId: junctionSourceField.id,
        }),
        widgetObjectMetadataId: COMPANY_OBJECT_ID,
        flatFieldMetadataMaps: buildFlatFieldMetadataMaps([
          junctionSourceField,
          ownedOpportunitiesField,
        ]),
      }),
    ).toThrow(/one-to-many or many-to-one/);
  });

  it('should throw when the nested field is a junction relation', () => {
    const junctionField = getFlatFieldMetadataMock({
      id: 'person-junction-field-id',
      universalIdentifier: 'person-junction-field-ui',
      objectMetadataId: PERSON_OBJECT_ID,
      type: FieldMetadataType.RELATION,
      name: 'petCareAgreements',
      label: 'Pet care agreements',
      settings: {
        relationType: RelationType.ONE_TO_MANY,
        junctionTargetFieldId: 'junction-target-field-id',
      },
      relationTargetObjectMetadataId: OPPORTUNITY_OBJECT_ID,
    });

    expect(() =>
      validateFieldConfigurationNestedRelationOrThrow({
        widgetConfiguration: buildFieldConfiguration({
          nestedRelationFieldMetadataId: junctionField.id,
        }),
        widgetObjectMetadataId: COMPANY_OBJECT_ID,
        flatFieldMetadataMaps: buildFlatFieldMetadataMaps([
          peopleField,
          ownedOpportunitiesField,
          junctionField,
        ]),
      }),
    ).toThrow(/one-to-many/);
  });

  it('should throw when the nested field does not belong to the relation target', () => {
    const opportunityStagesField = getFlatFieldMetadataMock({
      id: 'opportunity-stages-field-id',
      universalIdentifier: 'opportunity-stages-field-ui',
      objectMetadataId: OPPORTUNITY_OBJECT_ID,
      type: FieldMetadataType.RELATION,
      name: 'stages',
      label: 'Stages',
      settings: { relationType: RelationType.ONE_TO_MANY },
      relationTargetObjectMetadataId: COMPANY_OBJECT_ID,
    });

    expect(() =>
      validateFieldConfigurationNestedRelationOrThrow({
        widgetConfiguration: buildFieldConfiguration({
          nestedRelationFieldMetadataId: opportunityStagesField.id,
        }),
        widgetObjectMetadataId: COMPANY_OBJECT_ID,
        flatFieldMetadataMaps: buildFlatFieldMetadataMaps([
          peopleField,
          ownedOpportunitiesField,
          opportunityStagesField,
        ]),
      }),
    ).toThrow(/does not belong to the relation target/);
  });
});
