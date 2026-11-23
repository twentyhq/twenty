import {
  AggregateOperations,
  FieldMetadataType,
  ViewFilterOperand,
} from 'twenty-shared/types';

import { findRollupFlatFieldMetadatasDependingOnFields } from 'src/engine/metadata-modules/flat-field-metadata/utils/find-rollup-flat-field-metadatas-depending-on-fields.util';

const buildRollup = ({
  universalIdentifier,
  relation,
  aggregated = null,
  filterFields = [],
}: {
  universalIdentifier: string;
  relation: string;
  aggregated?: string | null;
  filterFields?: string[];
}) => ({
  universalIdentifier,
  universalSettings: {
    relationFieldMetadataUniversalIdentifier: relation,
    aggregateOperation: AggregateOperations.SUM as const,
    aggregatedFieldMetadataUniversalIdentifier: aggregated,
    filters: filterFields.map((fieldMetadataUniversalIdentifier, index) => ({
      id: `filter-${index}`,
      fieldMetadataUniversalIdentifier,
      operand: ViewFilterOperand.IS,
      value: 'value',
    })),
    filterGroups: [],
    resultType: FieldMetadataType.NUMBER as const,
  },
});

describe('findRollupFlatFieldMetadatasDependingOnFields', () => {
  const totalAmount = buildRollup({
    universalIdentifier: 'company.totalAmount',
    relation: 'company.opportunities',
    aggregated: 'opportunity.amount',
  });
  const wonCount = buildRollup({
    universalIdentifier: 'company.wonCount',
    relation: 'company.opportunities',
    filterFields: ['opportunity.stage'],
  });
  const groupTotal = buildRollup({
    universalIdentifier: 'group.totalAmount',
    relation: 'group.companies',
    aggregated: 'company.totalAmount',
  });
  const taskCount = buildRollup({
    universalIdentifier: 'project.taskCount',
    relation: 'project.tasks',
  });
  const rollups = [totalAmount, wonCount, groupTotal, taskCount];

  const findDependents = (fieldMetadataUniversalIdentifiers: string[]) =>
    findRollupFlatFieldMetadatasDependingOnFields({
      fieldMetadataUniversalIdentifiers,
      rollupFlatFieldMetadatas: rollups,
    }).map(({ universalIdentifier }) => universalIdentifier);

  it('should find the rollups going through a relation', () => {
    expect(findDependents(['project.tasks'])).toEqual(['project.taskCount']);
  });

  it('should find the rollups filtering on a field', () => {
    expect(findDependents(['opportunity.stage'])).toEqual(['company.wonCount']);
  });

  it('should follow a rollup aggregated by another rollup', () => {
    expect(findDependents(['opportunity.amount'])).toEqual([
      'company.totalAmount',
      'group.totalAmount',
    ]);
  });

  it('should not return the starting fields themselves', () => {
    expect(findDependents(['company.totalAmount'])).toEqual([
      'group.totalAmount',
    ]);
  });

  it('should return nothing when no rollup reads the field', () => {
    expect(findDependents(['person.name'])).toEqual([]);
  });
});
