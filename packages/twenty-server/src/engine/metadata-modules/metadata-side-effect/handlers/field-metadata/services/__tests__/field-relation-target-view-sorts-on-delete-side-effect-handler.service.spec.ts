import { FieldMetadataType, ViewSortDirection } from 'twenty-shared/types';

import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatViewSort } from 'src/engine/metadata-modules/flat-view-sort/types/flat-view-sort.type';
import { FieldRelationTargetViewSortsOnDeleteSideEffectHandlerService } from 'src/engine/metadata-modules/metadata-side-effect/handlers/field-metadata/services/field-relation-target-view-sorts-on-delete-side-effect-handler.service';

const DELETED_FIELD_UNIVERSAL_IDENTIFIER = 'deleted-target-field';
const REPLACEMENT_FIELD_UNIVERSAL_IDENTIFIER = 'replacement-target-field';

const buildFlatViewSort = ({
  universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier,
}: {
  universalIdentifier: string;
  relationTargetFieldMetadataUniversalIdentifier: string | null;
}): FlatViewSort => ({
  id: `${universalIdentifier}-id`,
  universalIdentifier,
  workspaceId: 'workspace-id',
  applicationId: 'application-id',
  applicationUniversalIdentifier: 'application',
  fieldMetadataId: 'relation-field-id',
  fieldMetadataUniversalIdentifier: 'relation-field',
  viewId: 'view-id',
  viewUniversalIdentifier: 'view',
  direction: ViewSortDirection.ASC,
  subFieldName: null,
  relationTargetFieldMetadataId: null,
  relationTargetFieldMetadataUniversalIdentifier,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  deletedAt: null,
});

const buildSideEffects = ({
  flatViewSorts,
  allFlatEntityOperationRecordByMetadataName = {},
}: {
  flatViewSorts: FlatViewSort[];
  allFlatEntityOperationRecordByMetadataName?: AllFlatEntityOperationRecordByMetadataName;
}) => {
  const relatedFlatEntityMaps = createEmptyAllFlatEntityMaps();

  for (const flatViewSort of flatViewSorts) {
    relatedFlatEntityMaps.flatViewSortMaps.byUniversalIdentifier[
      flatViewSort.universalIdentifier
    ] = flatViewSort;
  }

  return new FieldRelationTargetViewSortsOnDeleteSideEffectHandlerService().buildSideEffects(
    {
      flatEntity: getFlatFieldMetadataMock({
        objectMetadataId: 'company-object-id',
        universalIdentifier: DELETED_FIELD_UNIVERSAL_IDENTIFIER,
        type: FieldMetadataType.NUMBER,
      }),
      allFlatEntityOperationRecordByMetadataName,
      relatedFlatEntityMaps,
      context: {
        buildOptions: {
          isSystemBuild: false,
          applicationUniversalIdentifier: 'application',
        },
      },
    },
  );
};

describe('FieldRelationTargetViewSortsOnDeleteSideEffectHandlerService', () => {
  it('deletes the view sorts that order by the deleted field through a relation', () => {
    const sortOnDeletedField = buildFlatViewSort({
      universalIdentifier: 'sort-on-deleted-field',
      relationTargetFieldMetadataUniversalIdentifier:
        DELETED_FIELD_UNIVERSAL_IDENTIFIER,
    });
    const sortOnOtherField = buildFlatViewSort({
      universalIdentifier: 'sort-on-other-field',
      relationTargetFieldMetadataUniversalIdentifier:
        REPLACEMENT_FIELD_UNIVERSAL_IDENTIFIER,
    });
    const sortWithoutRelationTarget = buildFlatViewSort({
      universalIdentifier: 'sort-without-relation-target',
      relationTargetFieldMetadataUniversalIdentifier: null,
    });

    expect(
      buildSideEffects({
        flatViewSorts: [
          sortOnDeletedField,
          sortOnOtherField,
          sortWithoutRelationTarget,
        ],
      }),
    ).toEqual({
      status: 'success',
      operations: {
        viewSort: {
          flatEntityToDelete: {
            [sortOnDeletedField.universalIdentifier]: sortOnDeletedField,
          },
        },
      },
    });
  });

  it('keeps a view sort that the same migration repoints to another field', () => {
    const repointedSort = buildFlatViewSort({
      universalIdentifier: 'repointed-sort',
      relationTargetFieldMetadataUniversalIdentifier:
        DELETED_FIELD_UNIVERSAL_IDENTIFIER,
    });

    expect(
      buildSideEffects({
        flatViewSorts: [repointedSort],
        allFlatEntityOperationRecordByMetadataName: {
          viewSort: {
            flatEntityToCreate: {},
            flatEntityToUpdate: {
              [repointedSort.universalIdentifier]: {
                ...repointedSort,
                relationTargetFieldMetadataUniversalIdentifier:
                  REPLACEMENT_FIELD_UNIVERSAL_IDENTIFIER,
              },
            },
            flatEntityToDelete: {},
          },
        },
      }),
    ).toEqual({ status: 'noop' });
  });
});
