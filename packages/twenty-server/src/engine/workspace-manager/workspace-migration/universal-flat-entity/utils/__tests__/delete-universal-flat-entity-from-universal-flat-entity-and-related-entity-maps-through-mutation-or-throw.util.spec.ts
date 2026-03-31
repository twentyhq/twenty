import { FieldMetadataType } from 'twenty-shared/types';

import { type MetadataUniversalFlatEntityAndRelatedFlatEntityMapsForValidation } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-and-related-flat-entity-maps-for-validation.type';
import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { type UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';
import { addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/add-universal-flat-entity-to-universal-flat-entity-maps-through-mutation-or-throw.util';
import { deleteUniversalFlatEntityFromUniversalFlatEntityAndRelatedEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/delete-universal-flat-entity-from-universal-flat-entity-and-related-entity-maps-through-mutation-or-throw.util';

const createEmptyUniversalFlatEntityMaps = <T>(): UniversalFlatEntityMaps<
  T & { universalIdentifier: string; applicationUniversalIdentifier: string }
> => ({
  byUniversalIdentifier: {},
});

describe('deleteUniversalFlatEntityFromUniversalFlatEntityAndRelatedEntityMapsThroughMutationOrThrow', () => {
  it('should delete a view and update related objectMetadata by removing viewUniversalIdentifier', () => {
    const objectMetadataUniversalIdentifier = 'object-universal-1';
    const fieldMetadataUniversalIdentifier = 'field-universal-1';
    const viewUniversalIdentifier = 'view-universal-1';
    const applicationUniversalIdentifier =
      '20202020-f3ad-452e-b5b6-2d49d3ea88b1';

    const mockUniversalObjectMetadata = {
      universalIdentifier: objectMetadataUniversalIdentifier,
      viewUniversalIdentifiers: [viewUniversalIdentifier],
      fieldUniversalIdentifiers: [],
      indexMetadataUniversalIdentifiers: [],
      description: 'default flat object metadata description',
      icon: 'icon',
      isActive: true,
      isAuditLogged: true,
      isCustom: true,
      isLabelSyncedWithName: false,
      isRemote: false,
      isSearchable: true,
      isSystem: false,
      isUIReadOnly: false,
      labelPlural: 'default flat object metadata label plural',
      labelSingular: 'default flat object metadata label singular',
      namePlural: 'defaultflatObjectMetadataNamePlural',
      nameSingular: 'defaultflatObjectMetadataNameSingular',
      shortcut: 'shortcut',
      standardOverrides: null,
      targetTableName: '',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      duplicateCriteria: null,
      applicationUniversalIdentifier,
      labelIdentifierFieldMetadataUniversalIdentifier:
        '20202020-1a62-405c-87fa-4d4fd215851b',
      imageIdentifierFieldMetadataUniversalIdentifier:
        '20202020-9d65-415f-b0e1-216a2e257ea4',
    };

    const mockUniversalFieldMetadata = {
      universalIdentifier: fieldMetadataUniversalIdentifier,
      objectMetadataUniversalIdentifier,
      type: FieldMetadataType.DATE,
      applicationUniversalIdentifier,
      viewFieldUniversalIdentifiers: [],
      viewFilterUniversalIdentifiers: [],
      calendarViewUniversalIdentifiers: [viewUniversalIdentifier],
      mainGroupByFieldMetadataViewUniversalIdentifiers: [],
      kanbanAggregateOperationViewUniversalIdentifiers: [],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      defaultValue: null,
      options: null,
      morphId: null,
      settings: null,
      universalSettings: null,
      description: 'default flat field metadata description',
      icon: 'icon',
      isActive: true,
      isCustom: true,
      name: 'flatFieldMetadataName',
      label: 'flat field metadata label',
      isNullable: true,
      isUnique: false,
      isUIReadOnly: false,
      isLabelSyncedWithName: false,
      isSystem: false,
      standardOverrides: null,
      relationTargetObjectMetadataUniversalIdentifier: null,
      relationTargetFieldMetadataUniversalIdentifier: null,
    };

    const mockUniversalView = {
      universalIdentifier: viewUniversalIdentifier,
      objectMetadataUniversalIdentifier,
      viewFieldUniversalIdentifiers: [],
      viewFilterUniversalIdentifiers: [],
      viewGroupUniversalIdentifiers: [],
      applicationUniversalIdentifier,
      calendarFieldMetadataUniversalIdentifier:
        fieldMetadataUniversalIdentifier,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      name: 'Test View',
      type: 'table',
      icon: 'IconList',
      isCompact: false,
      position: 0,
      key: null,
      kanbanFieldMetadataUniversalIdentifier: null,
      kanbanAggregateOperationFieldMetadataUniversalIdentifier: null,
      kanbanAggregateOperation: null,
      mainGroupByFieldMetadataUniversalIdentifier: null,
      viewFilterGroupUniversalIdentifiers: [],
      rowLevelPermissionPredicateGroupUniversalIdentifiers: [],
    };

    const flatObjectMetadataMaps =
      createEmptyUniversalFlatEntityMaps<typeof mockUniversalObjectMetadata>();

    addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
      universalFlatEntity: mockUniversalObjectMetadata,
      universalFlatEntityMapsToMutate: flatObjectMetadataMaps,
    });

    const flatFieldMetadataMaps =
      createEmptyUniversalFlatEntityMaps<typeof mockUniversalFieldMetadata>();

    addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
      universalFlatEntity: mockUniversalFieldMetadata,
      universalFlatEntityMapsToMutate: flatFieldMetadataMaps,
    });

    const flatViewMaps =
      createEmptyUniversalFlatEntityMaps<typeof mockUniversalView>();

    addUniversalFlatEntityToUniversalFlatEntityMapsThroughMutationOrThrow({
      universalFlatEntity: mockUniversalView,
      universalFlatEntityMapsToMutate: flatViewMaps,
    });

    const universalFlatEntityAndRelatedMapsToMutate = {
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
      flatViewMaps,
    } as unknown as MetadataUniversalFlatEntityAndRelatedFlatEntityMapsForValidation<'view'>;

    expect(
      findFlatEntityByUniversalIdentifier({
        universalIdentifier: viewUniversalIdentifier,
        flatEntityMaps:
          universalFlatEntityAndRelatedMapsToMutate.flatViewMaps as UniversalFlatEntityMaps<FlatView>,
      }),
    ).toBeDefined();

    deleteUniversalFlatEntityFromUniversalFlatEntityAndRelatedEntityMapsThroughMutationOrThrow(
      {
        metadataName: 'view',
        universalFlatEntity:
          mockUniversalView as unknown as MetadataUniversalFlatEntity<'view'>,
        universalFlatEntityAndRelatedMapsToMutate,
      },
    );

    expect(
      findFlatEntityByUniversalIdentifier({
        universalIdentifier: viewUniversalIdentifier,
        flatEntityMaps:
          universalFlatEntityAndRelatedMapsToMutate.flatViewMaps as UniversalFlatEntityMaps<FlatView>,
      }),
    ).toBeUndefined();

    const updatedObjectMetadata = findFlatEntityByUniversalIdentifier({
      universalIdentifier: objectMetadataUniversalIdentifier,
      flatEntityMaps:
        universalFlatEntityAndRelatedMapsToMutate.flatObjectMetadataMaps as UniversalFlatEntityMaps<FlatObjectMetadata>,
    });

    expect(updatedObjectMetadata).toMatchObject({
      viewUniversalIdentifiers: [],
    });

    const updatedFieldMetadata = findFlatEntityByUniversalIdentifier({
      universalIdentifier: fieldMetadataUniversalIdentifier,
      flatEntityMaps:
        universalFlatEntityAndRelatedMapsToMutate.flatFieldMetadataMaps as UniversalFlatEntityMaps<FlatFieldMetadata>,
    });

    expect(updatedFieldMetadata).toMatchObject({
      calendarViewUniversalIdentifiers: [],
    });
  });
});
