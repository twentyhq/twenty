import { FieldMetadataType } from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatFieldMetadatasWithDisabledActionsByObjectId } from 'src/engine/twenty-orm/utils/get-flat-field-metadatas-with-disabled-actions-by-object-id.util';

const OBJECT_METADATA_ID = 'note-object-id';
const MORPH_ID = 'target-morph-id';

const buildMaps = (
  headDisabledFieldPermissionActions:
    | ('canReadFieldValue' | 'canUpdateFieldValue')[]
    | null,
) =>
  [
    getFlatFieldMetadataMock({
      id: 'target-head-id',
      universalIdentifier: MORPH_ID,
      morphId: MORPH_ID,
      objectMetadataId: OBJECT_METADATA_ID,
      type: FieldMetadataType.MORPH_RELATION,
      name: 'target',
      disabledFieldPermissionActions: headDisabledFieldPermissionActions,
    }),
    getFlatFieldMetadataMock({
      id: 'target-company-id',
      universalIdentifier: 'target-company-universal-identifier',
      morphId: MORPH_ID,
      objectMetadataId: OBJECT_METADATA_ID,
      type: FieldMetadataType.MORPH_RELATION,
      name: 'targetCompany',
    }),
    getFlatFieldMetadataMock({
      id: 'target-person-id',
      universalIdentifier: 'target-person-universal-identifier',
      morphId: MORPH_ID,
      objectMetadataId: OBJECT_METADATA_ID,
      type: FieldMetadataType.MORPH_RELATION,
      name: 'targetPerson',
    }),
  ].reduce(
    (maps, flatEntity) =>
      addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity,
        flatEntityMaps: maps,
      }),
    createEmptyFlatEntityMaps(),
  );

describe('getFlatFieldMetadatasWithDisabledActionsByObjectId', () => {
  it('should apply the disabled actions of a morph relation head to every target', () => {
    const fields = getFlatFieldMetadatasWithDisabledActionsByObjectId(
      buildMaps(['canUpdateFieldValue']),
    ).get(OBJECT_METADATA_ID);

    expect(fields?.map(({ id }) => id).sort()).toEqual([
      'target-company-id',
      'target-head-id',
      'target-person-id',
    ]);
    expect(
      fields?.every(
        ({ disabledFieldPermissionActions }) =>
          disabledFieldPermissionActions?.[0] === 'canUpdateFieldValue',
      ),
    ).toBe(true);
  });

  it('should list nothing when no field disables an action', () => {
    expect(
      getFlatFieldMetadatasWithDisabledActionsByObjectId(buildMaps(null)).size,
    ).toBe(0);
  });
});
