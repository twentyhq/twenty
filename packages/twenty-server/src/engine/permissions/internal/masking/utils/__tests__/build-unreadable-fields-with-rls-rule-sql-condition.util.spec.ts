import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { buildUnreadableFieldsWithRlsRuleSqlCondition } from 'src/engine/permissions/internal/masking/utils/build-unreadable-fields-with-rls-rule-sql-condition.util';

const flatObjectMetadata = getFlatObjectMetadataMock({
  id: 'person',
  universalIdentifier: 'person',
});

describe('buildUnreadableFieldsWithRlsRuleSqlCondition', () => {
  it('should keep the fields of an empty RLS rule filter unreadable on every record', () => {
    const [unreadableFields] = buildUnreadableFieldsWithRlsRuleSqlCondition({
      unreadableFieldsWithRlsRuleFilter: [
        { rlsRuleFilter: {}, fieldMetadataIds: ['field-id'] },
      ],
      flatObjectMetadata,
      metadataMaps: { flatFieldMetadataMaps: createEmptyFlatEntityMaps() },
      tableAlias: 'person',
    });

    expect(unreadableFields.fieldMetadataIds).toEqual(['field-id']);
    expect(unreadableFields.rlsRuleSqlCondition.sql).toMatch(/^(TRUE|1=1)$/);
  });
});
