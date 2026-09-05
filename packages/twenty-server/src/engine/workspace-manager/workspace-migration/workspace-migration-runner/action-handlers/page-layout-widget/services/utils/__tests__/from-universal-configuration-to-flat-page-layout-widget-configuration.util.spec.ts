import {
  AggregateOperations,
  FieldMetadataType,
  type UniversalChartFilter,
  ViewFilterOperand,
} from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatFrontComponent } from 'src/engine/metadata-modules/flat-front-component/types/flat-front-component.type';
import { FieldDisplayMode } from 'src/engine/metadata-modules/page-layout-widget/enums/field-display-mode.enum';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { fromUniversalConfigurationToFlatPageLayoutWidgetConfiguration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/page-layout-widget/services/utils/from-universal-configuration-to-flat-page-layout-widget-configuration.util';

const OBJECT_METADATA_ID = '00000000-0000-4000-8000-000000000000';
const RELATION_FIELD_ID = '11111111-1111-4111-8111-000000000001';
const RELATION_FIELD_UNIVERSAL_IDENTIFIER =
  '20202020-1111-4111-8111-000000000001';
const TARGET_TEXT_FIELD_ID = '11111111-2222-4222-8222-000000000002';
const TARGET_TEXT_FIELD_UNIVERSAL_IDENTIFIER =
  '20202020-2222-4222-8222-000000000002';
const AGGREGATE_FIELD_ID = '11111111-3333-4333-8333-000000000003';
const AGGREGATE_FIELD_UNIVERSAL_IDENTIFIER =
  '20202020-3333-4333-8333-000000000003';

const buildFlatFieldMetadataMaps = (
  flatFieldMetadatas: FlatFieldMetadata[],
): FlatEntityMaps<FlatFieldMetadata> => ({
  byUniversalIdentifier: Object.fromEntries(
    flatFieldMetadatas.map((flatFieldMetadata) => [
      flatFieldMetadata.universalIdentifier,
      flatFieldMetadata,
    ]),
  ),
  universalIdentifierById: Object.fromEntries(
    flatFieldMetadatas.map((flatFieldMetadata) => [
      flatFieldMetadata.id,
      flatFieldMetadata.universalIdentifier,
    ]),
  ),
  universalIdentifiersByApplicationId: {},
});

const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([
  getFlatFieldMetadataMock({
    id: RELATION_FIELD_ID,
    universalIdentifier: RELATION_FIELD_UNIVERSAL_IDENTIFIER,
    objectMetadataId: OBJECT_METADATA_ID,
    type: FieldMetadataType.RELATION,
  }),
  getFlatFieldMetadataMock({
    id: TARGET_TEXT_FIELD_ID,
    universalIdentifier: TARGET_TEXT_FIELD_UNIVERSAL_IDENTIFIER,
    objectMetadataId: OBJECT_METADATA_ID,
    type: FieldMetadataType.TEXT,
  }),
  getFlatFieldMetadataMock({
    id: AGGREGATE_FIELD_ID,
    universalIdentifier: AGGREGATE_FIELD_UNIVERSAL_IDENTIFIER,
    objectMetadataId: OBJECT_METADATA_ID,
    type: FieldMetadataType.NUMBER,
  }),
]);

const getChartRecordFilters = (
  recordFilters: NonNullable<UniversalChartFilter['recordFilters']>,
) => {
  const configuration =
    fromUniversalConfigurationToFlatPageLayoutWidgetConfiguration({
      universalConfiguration: {
        configurationType: WidgetConfigurationType.AGGREGATE_CHART,
        aggregateFieldMetadataUniversalIdentifier:
          AGGREGATE_FIELD_UNIVERSAL_IDENTIFIER,
        aggregateOperation: AggregateOperations.SUM,
        filter: { recordFilters },
      },
      flatFieldMetadataMaps,
      flatFrontComponentMaps: createEmptyFlatEntityMaps(),
      flatViewMaps: createEmptyFlatEntityMaps(),
      flatViewFieldGroupMaps: createEmptyFlatEntityMaps(),
    });

  if (
    configuration.configurationType !== WidgetConfigurationType.AGGREGATE_CHART
  ) {
    throw new Error('Expected an aggregate chart configuration');
  }

  return configuration.filter?.recordFilters;
};

describe('fromUniversalConfigurationToFlatPageLayoutWidgetConfiguration', () => {
  it('should create a field widget without its embedded view when the view does not exist yet', () => {
    expect(
      fromUniversalConfigurationToFlatPageLayoutWidgetConfiguration({
        universalConfiguration: {
          configurationType: WidgetConfigurationType.FIELD,
          fieldMetadataId: RELATION_FIELD_UNIVERSAL_IDENTIFIER,
          fieldDisplayMode: FieldDisplayMode.TABLE,
          viewId: '40404040-4444-4444-8444-000000000004',
        },
        flatFieldMetadataMaps,
        flatFrontComponentMaps: createEmptyFlatEntityMaps(),
        flatViewMaps: createEmptyFlatEntityMaps(),
        flatViewFieldGroupMaps: createEmptyFlatEntityMaps(),
      }),
    ).toEqual({
      configurationType: WidgetConfigurationType.FIELD,
      fieldMetadataId: RELATION_FIELD_ID,
      fieldDisplayMode: FieldDisplayMode.TABLE,
      viewId: undefined,
    });
  });

  it('should preserve front component widget header command menu item references', () => {
    const frontComponentId = '11111111-4444-4444-8444-000000000004';
    const frontComponentUniversalIdentifier =
      '20202020-4444-4444-8444-000000000004';
    const headerCommandMenuItemUniversalIdentifiers = [
      '30303030-3333-4333-8333-000000000003',
    ];
    const flatFrontComponentMaps =
      createEmptyFlatEntityMaps() as FlatEntityMaps<FlatFrontComponent>;
    const flatFrontComponent = {
      id: frontComponentId,
      universalIdentifier: frontComponentUniversalIdentifier,
    } as FlatFrontComponent;

    flatFrontComponentMaps.byUniversalIdentifier[
      frontComponentUniversalIdentifier
    ] = flatFrontComponent;
    flatFrontComponentMaps.universalIdentifierById[frontComponentId] =
      frontComponentUniversalIdentifier;

    expect(
      fromUniversalConfigurationToFlatPageLayoutWidgetConfiguration({
        universalConfiguration: {
          configurationType: WidgetConfigurationType.FRONT_COMPONENT,
          frontComponentUniversalIdentifier,
          headerCommandMenuItemUniversalIdentifiers,
        },
        flatFieldMetadataMaps,
        flatFrontComponentMaps,
        flatViewMaps: createEmptyFlatEntityMaps(),
        flatViewFieldGroupMaps: createEmptyFlatEntityMaps(),
      }),
    ).toEqual({
      configurationType: WidgetConfigurationType.FRONT_COMPONENT,
      frontComponentId,
      headerCommandMenuItemUniversalIdentifiers,
    });
  });

  it('should resolve the relation target universal identifier of a relation-traversal chart filter back to a field metadata id', () => {
    const recordFilters = getChartRecordFilters([
      {
        fieldMetadataUniversalIdentifier: RELATION_FIELD_UNIVERSAL_IDENTIFIER,
        relationTargetFieldMetadataUniversalIdentifier:
          TARGET_TEXT_FIELD_UNIVERSAL_IDENTIFIER,
        operand: ViewFilterOperand.DOES_NOT_CONTAIN,
        value: 'foo',
      },
    ]);

    expect(recordFilters).toEqual([
      {
        fieldMetadataId: RELATION_FIELD_ID,
        relationTargetFieldMetadataId: TARGET_TEXT_FIELD_ID,
        operand: ViewFilterOperand.DOES_NOT_CONTAIN,
        value: 'foo',
      },
    ]);
  });
});
