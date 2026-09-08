import { FieldMetadataType } from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { buildNonAuditLoggedFieldNamesByObjectMetadataId } from 'src/modules/timeline/utils/build-non-audit-logged-field-names-by-object-metadata-id.util';

const COMPANY_OBJECT_METADATA_ID = 'company-object-metadata-id';

const buildField = ({
  universalIdentifier,
  name,
  type = FieldMetadataType.TEXT,
  isAuditLogged = true,
}: {
  universalIdentifier: string;
  name: string;
  type?: FieldMetadataType;
  isAuditLogged?: boolean;
}) =>
  getFlatFieldMetadataMock({
    universalIdentifier,
    objectMetadataId: COMPANY_OBJECT_METADATA_ID,
    type,
    name,
    isAuditLogged,
  });

const NAME_FIELD = buildField({
  universalIdentifier: 'name-field',
  name: 'name',
});
const LAST_CONTACT_AT_FIELD = buildField({
  universalIdentifier: 'last-contact-at-field',
  name: 'lastContactAt',
  type: FieldMetadataType.DATE_TIME,
  isAuditLogged: false,
});
const POSITION_FIELD = buildField({
  universalIdentifier: 'position-field',
  name: 'position',
  type: FieldMetadataType.POSITION,
});

const COMPANY_OBJECT_METADATA = getFlatObjectMetadataMock({
  universalIdentifier: 'company-object',
  id: COMPANY_OBJECT_METADATA_ID,
  nameSingular: 'company',
  fieldIds: [NAME_FIELD.id, LAST_CONTACT_AT_FIELD.id, POSITION_FIELD.id],
});

const buildMaps = <TFlatEntity extends { universalIdentifier: string }>(
  flatEntities: TFlatEntity[],
) =>
  flatEntities.reduce(
    (flatEntityMaps, flatEntity) =>
      addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity,
        flatEntityMaps,
      }),
    createEmptyFlatEntityMaps(),
  );

describe('buildNonAuditLoggedFieldNamesByObjectMetadataId', () => {
  it('collects the fields opted out of the audit log and the never audited types', () => {
    const nonAuditLoggedFieldNamesByObjectMetadataId =
      buildNonAuditLoggedFieldNamesByObjectMetadataId({
        flatObjectMetadataMaps: buildMaps([
          COMPANY_OBJECT_METADATA,
        ]) as FlatEntityMaps<FlatObjectMetadata>,
        flatFieldMetadataMaps: buildMaps([
          NAME_FIELD,
          LAST_CONTACT_AT_FIELD,
          POSITION_FIELD,
        ]) as FlatEntityMaps<OrmFlatFieldMetadata>,
      });

    expect(
      nonAuditLoggedFieldNamesByObjectMetadataId.get(
        COMPANY_OBJECT_METADATA_ID,
      ),
    ).toEqual(new Set(['lastContactAt', 'position']));
  });

  it('leaves out objects whose fields are all audit logged', () => {
    const nonAuditLoggedFieldNamesByObjectMetadataId =
      buildNonAuditLoggedFieldNamesByObjectMetadataId({
        flatObjectMetadataMaps: buildMaps([
          { ...COMPANY_OBJECT_METADATA, fieldIds: [NAME_FIELD.id] },
        ]) as FlatEntityMaps<FlatObjectMetadata>,
        flatFieldMetadataMaps: buildMaps([
          NAME_FIELD,
        ]) as FlatEntityMaps<OrmFlatFieldMetadata>,
      });

    expect(nonAuditLoggedFieldNamesByObjectMetadataId.size).toBe(0);
  });
});
