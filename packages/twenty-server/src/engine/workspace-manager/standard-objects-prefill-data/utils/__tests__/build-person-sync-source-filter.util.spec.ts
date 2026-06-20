import { buildPersonSyncSourceFilter } from 'src/engine/workspace-manager/standard-objects-prefill-data/utils/build-person-sync-source-filter.util';
import { evaluateStepFilters } from 'src/modules/workflow/workflow-executor/workflow-actions/filter/utils/evaluate-step-filters.util';

// Verifies the exact filter shipped on the seeded "Create company when adding a
// new person" workflow against representative person.upserted event payloads,
// evaluated through the same engine the trigger listener uses at runtime.
describe('buildPersonSyncSourceFilter', () => {
  const filter = buildPersonSyncSourceFilter({
    createdByFieldMetadataId: 'created-by-field-id',
  });

  const evaluateForSource = (source?: string) =>
    evaluateStepFilters({
      stepFilters: filter.stepFilters,
      stepFilterGroups: filter.stepFilterGroups,
      context: {
        trigger: {
          properties: {
            after: {
              createdBy: source === undefined ? {} : { source },
            },
          },
        },
      },
    });

  it('suppresses people auto-created by the email sync', () => {
    expect(evaluateForSource('EMAIL')).toBe(false);
  });

  it('suppresses people auto-created by the calendar sync', () => {
    expect(evaluateForSource('CALENDAR')).toBe(false);
  });

  it.each(['MANUAL', 'API', 'IMPORT', 'WORKFLOW', 'SYSTEM', 'WEBHOOK'])(
    'runs the workflow for people created via %s',
    (source) => {
      expect(evaluateForSource(source)).toBe(true);
    },
  );

  it('runs the workflow when the createdBy source is missing (fails open)', () => {
    expect(evaluateForSource(undefined)).toBe(true);
  });

  it('builds two ANDed source filters that reference the given field', () => {
    expect(filter.stepFilterGroups).toHaveLength(1);
    expect(filter.stepFilterGroups[0].logicalOperator).toBe('AND');

    expect(filter.stepFilters).toHaveLength(2);
    expect(
      filter.stepFilters.every(
        (stepFilter) =>
          stepFilter.fieldMetadataId === 'created-by-field-id' &&
          stepFilter.operand === 'IS_NOT' &&
          stepFilter.compositeFieldSubFieldName === 'source' &&
          stepFilter.stepFilterGroupId === filter.stepFilterGroups[0].id,
      ),
    ).toBe(true);
  });
});
