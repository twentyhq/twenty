import {
  CUSTOM_APPLICATION,
  NO_LIMITING_PRINCIPAL,
} from 'src/engine/permissions/__tests__/framework/given-principals.util';
import {
  APPLICATION_ROLE_ID,
  LIMITING_ROLE_ID,
} from 'src/engine/permissions/__tests__/framework/permission-test-ids.constant';
import {
  computeSweep,
  type SweepEntry,
} from 'src/engine/permissions/__tests__/sweep/compute-sweep.util';
import {
  findAccessAddedByPrincipal,
  findAccessLostByWideningRole,
  findEventDisagreements,
  findPlainSqlDisagreements,
  findRecordsHiddenFromObjectLevelAnswer,
  findReferenceRuleDisagreements,
  findSqlContentViolations,
} from 'src/engine/permissions/__tests__/sweep/find-sweep-violations.util';
import { SWEEP_RECORDS } from 'src/engine/permissions/__tests__/sweep/sweep-dimensions.util';

const MAX_REPORTED_VIOLATIONS = 20;

describe('record access sweep', () => {
  let entries: SweepEntry[];

  beforeAll(async () => {
    entries = await computeSweep();
  });

  const expectNoViolation = (violations: string[]) =>
    expect(violations.slice(0, MAX_REPORTED_VIOLATIONS)).toEqual([]);

  it('covers every combination', () => {
    expect(entries.length * SWEEP_RECORDS.length).toBeGreaterThan(1000000);
  });

  it('decides every combination like the reference rules', () => {
    expectNoViolation(findReferenceRuleDisagreements(entries));
  });

  it('never removes access when the main role grants more', () => {
    expectNoViolation(
      findAccessLostByWideningRole({ entries, slot: 'mainPrincipal' }),
    );
  });

  it('never removes access when the limiting role grants more', () => {
    expectNoViolation(
      findAccessLostByWideningRole({ entries, slot: 'limitingPrincipal' }),
    );
  });

  it('never removes access when the application role grants more', () => {
    expectNoViolation(
      findAccessLostByWideningRole({ entries, slot: 'applicationPrincipal' }),
    );
  });

  it('never adds access through a limiting principal, shares to its role aside', () => {
    expectNoViolation(
      findAccessAddedByPrincipal({
        entries,
        slot: 'limitingPrincipal',
        withoutPrincipal: NO_LIMITING_PRINCIPAL,
        roleId: LIMITING_ROLE_ID,
      }),
    );
  });

  it('never adds access through an application principal, shares to its role aside', () => {
    expectNoViolation(
      findAccessAddedByPrincipal({
        entries,
        slot: 'applicationPrincipal',
        withoutPrincipal: CUSTOM_APPLICATION,
        roleId: APPLICATION_ROLE_ID,
      }),
    );
  });

  it('agrees with the SQL decision when that decision is a plain answer', () => {
    expectNoViolation(findPlainSqlDisagreements(entries));
  });

  it('writes the same rules into its SQL condition', () => {
    expectNoViolation(findSqlContentViolations(entries));
  });

  it('filters events like it decides records', () => {
    expectNoViolation(findEventDisagreements(entries));
  });

  it('only hides from the object level answer a creator reading its own private records', () => {
    expectNoViolation(findRecordsHiddenFromObjectLevelAnswer(entries));
  });
});
