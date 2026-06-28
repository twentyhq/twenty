import { FieldMetadataType } from 'twenty-shared/types';
import { fromFieldMetadataEntityToFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/from-field-metadata-entity-to-flat-field-metadata.util';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

describe('fromFieldMetadataEntityToFlatFieldMetadata', () => {
  it('should map settings correctly for RELATION field types', () => {
    const mockEntity = {
      id: 'field-uuid-1',
      type: FieldMetadataType.RELATION,
      settings: {
        relationType: 'MANY_TO_ONE',
        onDelete: 'SET_NULL',
        joinColumnName: 'targetLigacaoId',
        junctionTargetFieldId: 'junction-field-uuid',
      },
      applicationId: 'mock-app-id',
      objectMetadataId: 'mock-obj-id',
      relationTargetFieldMetadataId: 'mock-target-field-id',
      relationTargetObjectMetadataId: 'mock-target-obj-id',
      kanbanAggregateOperationViews: [],
      calendarViews: [],
      mainGroupByFieldMetadataViews: [],
      viewFields: [],
      viewFilters: [],
      viewSorts: [],
      fieldPermissions: [],
      defaultValue: null,
      options: null,
      standardOverrides: null,
    } as unknown as FieldMetadataEntity;

    const mockFieldMetadataIdToUniversalIdentifierMap = new Map<string, string>(
      [
        ['junction-field-uuid', 'junctionFieldUniversalId'],
        ['mock-target-field-id', 'mockTargetFieldUniversalId'],
      ],
    );
    const mockObjectMetadataIdToUniversalIdentifierMap = new Map<
      string,
      string
    >([
      ['mock-obj-id', 'mockObjUniversalId'],
      ['mock-target-obj-id', 'mockTargetObjUniversalId'],
    ]);
    const mockApplicationIdToUniversalIdentifierMap = new Map<string, string>([
      ['mock-app-id', 'mockAppUniversalId'],
    ]);

    const result = fromFieldMetadataEntityToFlatFieldMetadata({
      entity: mockEntity,
      fieldMetadataIdToUniversalIdentifierMap:
        mockFieldMetadataIdToUniversalIdentifierMap,
      objectMetadataIdToUniversalIdentifierMap:
        mockObjectMetadataIdToUniversalIdentifierMap,
      applicationIdToUniversalIdentifierMap:
        mockApplicationIdToUniversalIdentifierMap,
    });

    expect(result.settings).toBeDefined();
    expect(result.settings).toEqual({
      relationType: 'MANY_TO_ONE',
      onDelete: 'SET_NULL',
      joinColumnName: 'targetLigacaoId',
      junctionTargetFieldId: 'junction-field-uuid',
      junctionTargetFieldUniversalIdentifier: 'junctionFieldUniversalId',
    });

    expect(result.universalSettings).toBeDefined();
    expect(result.universalSettings).toEqual({
      relationType: 'MANY_TO_ONE',
      onDelete: 'SET_NULL',
      joinColumnName: 'targetLigacaoId',
      junctionTargetFieldId: 'junction-field-uuid',
      junctionTargetFieldUniversalIdentifier: 'junctionFieldUniversalId',
    });
  });

  it('should map settings correctly for MORPH_RELATION field types', () => {
    const mockEntity = {
      id: 'field-uuid-1',
      type: FieldMetadataType.MORPH_RELATION,
      settings: {
        relationType: 'MANY_TO_ONE',
        onDelete: 'SET_NULL',
        joinColumnName: 'targetLigacaoId',
      },
      applicationId: 'mock-app-id',
      objectMetadataId: 'mock-obj-id',
      relationTargetFieldMetadataId: 'mock-target-field-id',
      relationTargetObjectMetadataId: 'mock-target-obj-id',
      kanbanAggregateOperationViews: [],
      calendarViews: [],
      mainGroupByFieldMetadataViews: [],
      viewFields: [],
      viewFilters: [],
      viewSorts: [],
      fieldPermissions: [],
      defaultValue: null,
      options: null,
      standardOverrides: null,
    } as unknown as FieldMetadataEntity;

    const mockFieldMetadataIdToUniversalIdentifierMap = new Map<string, string>(
      [['mock-target-field-id', 'mockTargetFieldUniversalId']],
    );
    const mockObjectMetadataIdToUniversalIdentifierMap = new Map<
      string,
      string
    >([
      ['mock-obj-id', 'mockObjUniversalId'],
      ['mock-target-obj-id', 'mockTargetObjUniversalId'],
    ]);
    const mockApplicationIdToUniversalIdentifierMap = new Map<string, string>([
      ['mock-app-id', 'mockAppUniversalId'],
    ]);

    const result = fromFieldMetadataEntityToFlatFieldMetadata({
      entity: mockEntity,
      fieldMetadataIdToUniversalIdentifierMap:
        mockFieldMetadataIdToUniversalIdentifierMap,
      objectMetadataIdToUniversalIdentifierMap:
        mockObjectMetadataIdToUniversalIdentifierMap,
      applicationIdToUniversalIdentifierMap:
        mockApplicationIdToUniversalIdentifierMap,
    });

    expect(result.settings).toBeDefined();
    expect(result.settings).toEqual({
      relationType: 'MANY_TO_ONE',
      onDelete: 'SET_NULL',
      joinColumnName: 'targetLigacaoId',
    });

    expect(result.universalSettings).toBeDefined();
    expect(result.universalSettings).toEqual({
      relationType: 'MANY_TO_ONE',
      onDelete: 'SET_NULL',
      joinColumnName: 'targetLigacaoId',
    });
  });
});
