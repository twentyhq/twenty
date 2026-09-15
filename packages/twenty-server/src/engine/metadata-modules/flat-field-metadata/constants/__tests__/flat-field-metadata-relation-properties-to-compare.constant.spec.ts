import { ALL_UNIVERSAL_FLAT_ENTITY_PROPERTIES_TO_COMPARE_AND_STRINGIFY } from 'src/engine/metadata-modules/flat-entity/constant/all-universal-flat-entity-properties-to-compare-and-stringify.constant';
import { FLAT_FIELD_METADATA_RELATION_PROPERTIES_TO_COMPARE } from 'src/engine/metadata-modules/flat-field-metadata/constants/flat-field-metadata-relation-properties-to-compare.constant';

const COMPARED_PROPERTIES: readonly string[] =
  ALL_UNIVERSAL_FLAT_ENTITY_PROPERTIES_TO_COMPARE_AND_STRINGIFY.fieldMetadata
    .propertiesToCompare;

const RELATION_UPDATABLE_PROPERTIES: readonly string[] =
  FLAT_FIELD_METADATA_RELATION_PROPERTIES_TO_COMPARE;

const RELATION_UNSUPPORTED_COMPARED_PROPERTIES: Record<string, string> = {
  defaultValue:
    'RELATION and MORPH_RELATION are listed in FIELD_METADATA_TYPES_WITHOUT_DEFAULT_VALUE, so both sides of a comparison are always null',
  options:
    'options exist for RATING, SELECT and MULTI_SELECT only, so both sides of a comparison are always null',
  isUnique:
    'isUnique is derived from the single field unique indexes a relation never has, so the stored value is always false',
  isSearchable:
    'validateSearchableFlatFieldMetadata already refuses a searchable relation, and it runs before this allow-list is consulted',
};

describe('FLAT_FIELD_METADATA_RELATION_PROPERTIES_TO_COMPARE', () => {
  it('should classify every compared field metadata property as relation updatable or explicitly unsupported', () => {
    const unclassifiedProperties = COMPARED_PROPERTIES.filter(
      (property) =>
        !RELATION_UPDATABLE_PROPERTIES.includes(property) &&
        !(property in RELATION_UNSUPPORTED_COMPARED_PROPERTIES),
    );

    expect(unclassifiedProperties).toEqual([]);
  });

  it('should not keep an unsupported reason for a property that became relation updatable or stopped being compared', () => {
    const staleReasons = Object.keys(
      RELATION_UNSUPPORTED_COMPARED_PROPERTIES,
    ).filter(
      (property) =>
        RELATION_UPDATABLE_PROPERTIES.includes(property) ||
        !COMPARED_PROPERTIES.includes(property),
    );

    expect(staleReasons).toEqual([]);
  });
});
