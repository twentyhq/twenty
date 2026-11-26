/* @license Enterprise */

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatValidationRule } from 'src/engine/metadata-modules/flat-validation-rule/types/flat-validation-rule.type';
import { findActiveFlatValidationRulesReadingField } from 'src/engine/metadata-modules/validation-rule/utils/find-active-flat-validation-rules-reading-field.util';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

const NOW = '2026-11-02T00:00:00.000Z';

const READ_SCORE_TREE = { type: 'FIELD', fieldUniversalIdentifier: 'score' };
const READ_EMPLOYEES_TREE = {
  type: 'FIELD',
  fieldUniversalIdentifier: 'employees',
};
const READ_COMPANY_EMPLOYEES_TREE = {
  type: 'FIELD',
  relationFieldUniversalIdentifier: 'company',
  fieldUniversalIdentifier: 'employees',
};

const buildRule = (
  rule: Pick<FlatValidationRule, 'name' | 'tree'> & Partial<FlatValidationRule>,
): FlatValidationRule => ({
  id: `${rule.name}-id`,
  workspaceId: 'workspace-id',
  applicationId: 'application-id',
  universalIdentifier: rule.name,
  applicationUniversalIdentifier: 'application',
  objectMetadataId: 'object-metadata-id',
  objectMetadataUniversalIdentifier: 'object',
  errorFieldMetadataId: null,
  errorFieldMetadataUniversalIdentifier: null,
  description: null,
  icon: null,
  expression: null,
  bindings: {},
  message: 'Message',
  isActive: true,
  createdAt: NOW,
  updatedAt: NOW,
  ...rule,
});

const findRuleNames = ({
  rules,
  fieldUniversalIdentifiers = ['employees'],
}: {
  rules: FlatValidationRule[];
  fieldUniversalIdentifiers?: string[];
}) => {
  const flatValidationRuleMaps: FlatEntityMaps<FlatValidationRule> =
    createEmptyFlatEntityMaps();

  for (const rule of rules) {
    addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
      flatEntity: rule,
      flatEntityMapsToMutate: flatValidationRuleMaps,
    });
  }

  return findActiveFlatValidationRulesReadingField({
    fieldUniversalIdentifiers,
    flatValidationRuleMaps,
  }).map(({ name }) => name);
};

describe('findActiveFlatValidationRulesReadingField', () => {
  it('should find a rule reading the field directly or through a relation', () => {
    expect(
      findRuleNames({
        rules: [
          buildRule({ name: 'direct', tree: READ_EMPLOYEES_TREE }),
          buildRule({
            name: 'through relation',
            tree: READ_COMPANY_EMPLOYEES_TREE,
          }),
        ],
      }),
    ).toEqual(['direct', 'through relation']);
  });

  it('should find a rule reading the other side of a relation', () => {
    expect(
      findRuleNames({
        rules: [
          buildRule({
            name: 'through reverse side',
            tree: READ_COMPANY_EMPLOYEES_TREE,
          }),
        ],
        fieldUniversalIdentifiers: ['people', 'company'],
      }),
    ).toEqual(['through reverse side']);
  });

  it('should ignore inactive rules and rules reading other fields', () => {
    expect(
      findRuleNames({
        rules: [
          buildRule({
            name: 'inactive',
            tree: READ_EMPLOYEES_TREE,
            isActive: false,
          }),
          buildRule({
            name: 'other',
            tree: READ_SCORE_TREE,
          }),
          buildRule({ name: 'draft', tree: null }),
        ],
      }),
    ).toEqual([]);
  });
});
