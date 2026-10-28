import { ALL_OVERRIDABLE_PROPERTIES_BY_METADATA_NAME } from 'src/engine/metadata-modules/overrides/constants/all-overridable-properties-by-metadata-name.constant';
import { ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';
import { ALL_TRANSLATABLE_PROPERTIES_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-translatable-properties-by-metadata-name.constant';
import { WORKSPACE_OWNED_PROPERTIES_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/workspace-owned-properties-by-metadata-name.constant';

describe('registry-derived override property maps', () => {
  it('derives the overridable properties for every metadata entity', () => {
    expect(ALL_OVERRIDABLE_PROPERTIES_BY_METADATA_NAME).toMatchSnapshot();
  });

  it('derives the translatable properties for every metadata entity', () => {
    expect(ALL_TRANSLATABLE_PROPERTIES_BY_METADATA_NAME).toMatchSnapshot();
  });

  it.each([
    [
      'agent',
      [
        'label',
        'icon',
        'description',
        'prompt',
        'modelId',
        'responseFormat',
        'modelConfiguration',
        'isActive',
      ],
    ],
    ['skill', ['label', 'icon', 'description', 'content', 'isActive']],
  ] as const)(
    'lets the workspace override the editable properties of an application %s',
    (metadataName, overridableProperties) => {
      expect(ALL_OVERRIDABLE_PROPERTIES_BY_METADATA_NAME[metadataName]).toEqual(
        overridableProperties,
      );
      expect(
        ALL_ENTITY_PROPERTIES_CONFIGURATION_BY_METADATA_NAME[metadataName]
          .overrides,
      ).toEqual({
        toCompare: true,
        toStringify: true,
        universalProperty: undefined,
      });
      expect(
        WORKSPACE_OWNED_PROPERTIES_BY_METADATA_NAME[metadataName],
      ).toBeUndefined();
    },
  );
});
