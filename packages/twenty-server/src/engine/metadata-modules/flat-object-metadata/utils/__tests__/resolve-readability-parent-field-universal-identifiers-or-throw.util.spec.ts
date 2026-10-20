import { FieldMetadataType, MetadataReadability } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { resolveReadabilityParentFieldUniversalIdentifiersOrThrow } from 'src/engine/metadata-modules/flat-object-metadata/utils/resolve-readability-parent-field-universal-identifiers-or-throw.util';

const invoice = getFlatObjectMetadataMock({
  id: 'invoice-id',
  nameSingular: 'invoice',
  universalIdentifier: 'invoice-universal-identifier',
  readabilityParentFieldUniversalIdentifiers: ['invoice-company'],
} as Parameters<typeof getFlatObjectMetadataMock>[0]);

const buildField = ({
  universalIdentifier,
  objectMetadataId = invoice.id,
  type = FieldMetadataType.RELATION,
  relationType = RelationType.MANY_TO_ONE,
}: {
  universalIdentifier: string;
  objectMetadataId?: string;
  type?: FieldMetadataType;
  relationType?: RelationType;
}) =>
  ({
    universalIdentifier,
    objectMetadataId,
    type,
    settings: { relationType },
  }) as unknown as FlatFieldMetadata;

const flatFieldMetadataMaps = {
  byUniversalIdentifier: {
    'invoice-company': buildField({ universalIdentifier: 'invoice-company' }),
    'invoice-owner': buildField({ universalIdentifier: 'invoice-owner' }),
    'invoice-amount': buildField({
      universalIdentifier: 'invoice-amount',
      type: FieldMetadataType.CURRENCY,
    }),
    'person-company': buildField({
      universalIdentifier: 'person-company',
      objectMetadataId: 'person-id',
    }),
  },
} as unknown as FlatEntityMaps<FlatFieldMetadata>;

const resolve = (
  readability: MetadataReadability,
  requestedReadabilityParentFieldUniversalIdentifiers?: string[] | null,
) =>
  resolveReadabilityParentFieldUniversalIdentifiersOrThrow({
    flatObjectMetadata: invoice,
    readability,
    requestedReadabilityParentFieldUniversalIdentifiers,
    flatFieldMetadataMaps,
  });

describe('resolveReadabilityParentFieldUniversalIdentifiersOrThrow', () => {
  it('keeps the requested parent relations of an inheriting object', () => {
    expect(
      resolve(MetadataReadability.INHERITED, [
        'invoice-company',
        'invoice-owner',
        'invoice-company',
      ]),
    ).toEqual(['invoice-company', 'invoice-owner']);
  });

  it('keeps the existing parents when only the readability is sent', () => {
    expect(resolve(MetadataReadability.INHERITED)).toEqual(['invoice-company']);
  });

  it('clears parents when the object stops inheriting', () => {
    expect(resolve(MetadataReadability.OPEN)).toBeNull();
  });

  it('rejects parents on an object that does not inherit', () => {
    expect(() =>
      resolve(MetadataReadability.PRIVATE, ['invoice-company']),
    ).toThrow('INHERITED readability');
  });

  it('rejects an inheriting object without parents', () => {
    expect(() => resolve(MetadataReadability.INHERITED, [])).toThrow(
      'at least one parent field',
    );
  });

  it('rejects fields that are not a relation of the object', () => {
    expect(() =>
      resolve(MetadataReadability.INHERITED, ['invoice-amount']),
    ).toThrow('is not a relation of object invoice');
    expect(() =>
      resolve(MetadataReadability.INHERITED, ['person-company']),
    ).toThrow('is not a relation of object invoice');
  });
});
