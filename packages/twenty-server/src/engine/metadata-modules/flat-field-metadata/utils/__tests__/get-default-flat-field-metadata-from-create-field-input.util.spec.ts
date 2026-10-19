import { FieldMetadataType } from 'twenty-shared/types';

import { getDefaultFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/get-default-flat-field-metadata-from-create-field-input.util';

const getCreatedFieldIcon = ({
  type,
  icon,
}: {
  type: FieldMetadataType;
  icon?: string;
}) =>
  getDefaultFlatFieldMetadata({
    createFieldInput: { name: 'score', label: 'Score', type, icon },
    applicationUniversalIdentifier: '11111111-1111-1111-1111-111111111111',
    objectMetadataUniversalIdentifier: '22222222-2222-2222-2222-222222222222',
  }).icon;

describe('getDefaultFlatFieldMetadata', () => {
  it.each([
    {
      type: FieldMetadataType.NUMBER,
      icon: undefined,
      expected: 'Icon123',
    },
    { type: FieldMetadataType.ADDRESS, icon: '', expected: 'IconMap' },
    {
      type: FieldMetadataType.RELATION,
      icon: undefined,
      expected: 'IconRelationOneToMany',
    },
  ])(
    'defaults a $icon icon to the $type type icon',
    ({ type, icon, expected }) => {
      expect(getCreatedFieldIcon({ type, icon })).toBe(expected);
    },
  );

  it('keeps the provided icon', () => {
    expect(
      getCreatedFieldIcon({ type: FieldMetadataType.NUMBER, icon: 'IconStar' }),
    ).toBe('IconStar');
  });
});
