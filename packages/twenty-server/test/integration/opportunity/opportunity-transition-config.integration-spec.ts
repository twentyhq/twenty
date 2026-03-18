import {
  OPPORTUNITY_TRANSITION_CONFIG,
  OPPORTUNITY_VALIDATION_COLUMNS,
} from 'src/modules/opportunity/query-hooks/opportunity-update-one.pre-query.hook';

// Config contract tests: verify that the hardcoded config values in the
// opportunity pre-query hook are consistent with the live DB schema.
//
// These catch two classes of bugs that unit tests cannot:
//   1. Stage value/label mismatch — Twenty SELECT options have a stored
//      `value` that often differs from the display `label` (e.g. "Quote
//      requested" is stored as "QUOTING"). Referencing the wrong value
//      silently disables the validation rule.
//   2. Missing fetch column — every field name referenced in a rule must
//      also be listed in OPPORTUNITY_VALIDATION_COLUMNS so the SQL query
//      actually fetches it. Forgetting to add a new field means the hook
//      always receives `undefined` for that field and validation never fires.
describe('OpportunityTransitionConfig (integration)', () => {
  // Strip the SQL quoting from column entries: '"companyId"' → 'companyId'
  const fetchedColumns = OPPORTUNITY_VALIDATION_COLUMNS.map((col) =>
    col.replace(/"/g, ''),
  );

  // Collect every field name and stageFieldName referenced by the config
  const referencedFields = [
    OPPORTUNITY_TRANSITION_CONFIG.stageFieldName,
    ...OPPORTUNITY_TRANSITION_CONFIG.rules.flatMap((rule) =>
      rule.fields.map((f) => f.name),
    ),
  ];

  it('should only reference stage values that exist in fieldMetadata', async () => {
    const rows = await testDataSource.query(`
      SELECT fm.options
      FROM core."fieldMetadata" fm
      JOIN core."objectMetadata" om ON fm."objectMetadataId" = om.id
      WHERE om."nameSingular" = 'opportunity' AND fm.name = 'stage'
    `);

    expect(rows.length).toBe(1);

    const validValues: string[] = rows[0].options.map(
      (o: { value: string }) => o.value,
    );

    for (const rule of OPPORTUNITY_TRANSITION_CONFIG.rules) {
      for (const stage of rule.toStages) {
        expect(validValues).toContain(stage);
      }

      for (const stage of rule.fromStages ?? []) {
        expect(validValues).toContain(stage);
      }
    }
  });

  it('should include all rule field names in OPPORTUNITY_VALIDATION_COLUMNS', () => {
    for (const fieldName of referencedFields) {
      expect(fetchedColumns).toContain(fieldName);
    }
  });

  it('should only reference field names that exist as columns in the opportunity table', async () => {
    const rows = await testDataSource.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = (
        SELECT schema_name
        FROM information_schema.schemata
        WHERE schema_name LIKE 'workspace_%'
        LIMIT 1
      )
      AND table_name = 'opportunity'
    `);

    const actualColumns: string[] = rows.map(
      (r: { column_name: string }) => r.column_name,
    );

    for (const fieldName of referencedFields) {
      expect(actualColumns).toContain(fieldName);
    }
  });
});
