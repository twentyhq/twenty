import { OPPORTUNITY_TRANSITION_CONFIG } from 'src/modules/opportunity/query-hooks/opportunity-update-one.pre-query.hook';

// Config contract test: verifies that every stage value hardcoded in
// OPPORTUNITY_TRANSITION_CONFIG actually exists in the DB fieldMetadata.
// This catches mismatches between the code and the SELECT options defined
// in the Twenty UI (where stored `value` often differs from display `label`).
describe('OpportunityTransitionConfig (integration)', () => {
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
});
