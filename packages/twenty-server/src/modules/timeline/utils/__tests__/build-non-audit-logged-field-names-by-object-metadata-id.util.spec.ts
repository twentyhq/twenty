import { FieldMetadataType } from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { buildNonAuditLoggedFieldNamesByObjectMetadataId } from 'src/modules/timeline/utils/build-non-audit-logged-field-names-by-object-metadata-id.util';

const COMPANY_OBJECT_METADATA_ID = 'company-object-metadata-id';
const PERSON_OBJECT_METADATA_ID = 'person-object-metadata-id';

const buildField = ({
  universalIdentifier,
  name,
  objectMetadataId = COMPANY_OBJECT_METADATA_ID,
  isAuditLogged = true,
}: {
  universalIdentifier: string;
  name: string;
  objectMetadataId?: string;
  isAuditLogged?: boolean;
}) =>
  getFlatFieldMetadataMock({
    universalIdentifier,
    objectMetadataId,
    type: FieldMetadataType.TEXT,
    name,
    isAuditLogged,
  });

const buildMaps = (flatFieldMetadatas: ReturnType<typeof buildField>[]) =>
  flatFieldMetadatas.reduce(
    (flatEntityMaps, flatEntity) =>
      addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity,
        flatEntityMaps,
      }),
    createEmptyFlatEntityMaps(),
  ) as FlatEntityMaps<OrmFlatFieldMetadata>;

describe('buildNonAuditLoggedFieldNamesByObjectMetadataId', () => {
  it('groups the non audit logged field names by object', () => {
    const nonAuditLoggedFieldNamesByObjectMetadataId =
      buildNonAuditLoggedFieldNamesByObjectMetadataId(
        buildMaps([
          buildField({ universalIdentifier: 'name-field', name: 'name' }),
          buildField({
            universalIdentifier: 'last-contact-at-field',
            name: 'lastContactAt',
            isAuditLogged: false,
          }),
          buildField({
            universalIdentifier: 'position-field',
            name: 'position',
            isAuditLogged: false,
          }),
          buildField({
            universalIdentifier: 'person-last-contact-at-field',
            name: 'lastContactAt',
            objectMetadataId: PERSON_OBJECT_METADATA_ID,
            isAuditLogged: false,
          }),
        ]),
      );

    expect(
      nonAuditLoggedFieldNamesByObjectMetadataId.get(
        COMPANY_OBJECT_METADATA_ID,
      ),
    ).toEqual(new Set(['lastContactAt', 'position']));
    expect(
      nonAuditLoggedFieldNamesByObjectMetadataId.get(PERSON_OBJECT_METADATA_ID),
    ).toEqual(new Set(['lastContactAt']));
  });

  it('leaves out objects whose fields are all audit logged', () => {
    expect(
      buildNonAuditLoggedFieldNamesByObjectMetadataId(
        buildMaps([
          buildField({ universalIdentifier: 'name-field', name: 'name' }),
        ]),
      ).size,
    ).toBe(0);
  });
});
