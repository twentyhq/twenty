import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { validateFlatObjectMetadataOwnerField } from 'src/engine/metadata-modules/flat-object-metadata/validators/utils/validate-flat-object-metadata-owner-field.util';
import { type UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

const OBJECT_ID = 'object-universal-identifier';
const OTHER_OBJECT_ID = 'other-object-universal-identifier';
const OWNER_FIELD_ID = 'owner-field-universal-identifier';

const createField = ({
  objectMetadataUniversalIdentifier = OBJECT_ID,
  type = FieldMetadataType.RELATION,
  relationType = RelationType.MANY_TO_ONE,
  relationTargetObjectMetadataUniversalIdentifier = STANDARD_OBJECTS
    .workspaceMember.universalIdentifier,
}: {
  objectMetadataUniversalIdentifier?: string;
  type?: FieldMetadataType;
  relationType?: RelationType;
  relationTargetObjectMetadataUniversalIdentifier?: string;
}): UniversalFlatFieldMetadata =>
  ({
    universalIdentifier: OWNER_FIELD_ID,
    objectMetadataUniversalIdentifier,
    type,
    relationTargetObjectMetadataUniversalIdentifier,
    universalSettings: { relationType },
  }) as UniversalFlatFieldMetadata;

const validate = (...fields: UniversalFlatFieldMetadata[]): string[] =>
  validateFlatObjectMetadataOwnerField({
    universalFlatObjectMetadata: {
      universalIdentifier: OBJECT_ID,
      ownerFieldMetadataUniversalIdentifier: OWNER_FIELD_ID,
    },
    universalFlatFieldMetadataMaps: {
      byUniversalIdentifier: Object.fromEntries(
        fields.map((field) => [field.universalIdentifier, field]),
      ),
    } satisfies UniversalFlatEntityMaps<UniversalFlatFieldMetadata>,
  }).map(({ message }) => message);

describe('validateFlatObjectMetadataOwnerField', () => {
  it('should accept a many-to-one relation of the object targeting workspaceMember', () => {
    expect(validate(createField({}))).toEqual([]);
  });

  it('should accept no owner field', () => {
    expect(
      validateFlatObjectMetadataOwnerField({
        universalFlatObjectMetadata: {
          universalIdentifier: OBJECT_ID,
          ownerFieldMetadataUniversalIdentifier: null,
        },
        universalFlatFieldMetadataMaps: { byUniversalIdentifier: {} },
      }),
    ).toEqual([]);
  });

  it('should reject an unknown field', () => {
    expect(validate()).toEqual([
      'ownerFieldMetadataUniversalIdentifier validation failed: related field metadata not found',
    ]);
  });

  it('should reject a field belonging to another object', () => {
    expect(
      validate(
        createField({ objectMetadataUniversalIdentifier: OTHER_OBJECT_ID }),
      ),
    ).toEqual([
      'ownerFieldMetadataUniversalIdentifier validation failed: field belongs to another object',
    ]);
  });

  it('should reject a morph relation', () => {
    expect(
      validate(createField({ type: FieldMetadataType.MORPH_RELATION })),
    ).toEqual([
      'ownerFieldMetadataUniversalIdentifier validation failed: field is not a MANY_TO_ONE relation',
    ]);
  });

  it('should reject a one-to-many relation', () => {
    expect(
      validate(createField({ relationType: RelationType.ONE_TO_MANY })),
    ).toEqual([
      'ownerFieldMetadataUniversalIdentifier validation failed: field is not a MANY_TO_ONE relation',
    ]);
  });

  it('should reject a non-relation field', () => {
    expect(validate(createField({ type: FieldMetadataType.TEXT }))).toEqual([
      'ownerFieldMetadataUniversalIdentifier validation failed: field is not a MANY_TO_ONE relation',
    ]);
  });

  it('should reject a relation targeting another object', () => {
    expect(
      validate(
        createField({
          relationTargetObjectMetadataUniversalIdentifier: OTHER_OBJECT_ID,
        }),
      ),
    ).toEqual([
      'ownerFieldMetadataUniversalIdentifier validation failed: field does not target workspaceMember',
    ]);
  });
});
