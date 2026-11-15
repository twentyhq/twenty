import { buildRunInsightsDailySeriesQuery } from 'src/engine/utils/run-insights/build-run-insights-daily-series-query.util';

const POSITIONAL_PLACEHOLDERS = {
  timeZone: '$2',
  lastDayOffset: '$3',
  completedStatus: '$4',
  failedStatus: '$5',
};

describe('buildRunInsightsDailySeriesQuery', () => {
  it('buckets the runs of the source by local calendar day', () => {
    const query = buildRunInsightsDailySeriesQuery({
      runsSource: '"workspace"."agentTurn"',
      runsSourceCondition: '"run"."agentId" = $1',
      placeholders: POSITIONAL_PLACEHOLDERS,
    });

    expect(query).toContain('LEFT JOIN "workspace"."agentTurn" AS "run"');
    expect(query).toContain('ON "run"."agentId" = $1 AND "run"."createdAt"');
    expect(query).toContain(
      `DATE_TRUNC('day', NOW() AT TIME ZONE $2) - MAKE_INTERVAL(days => $3::int)`,
    );
    expect(query).toContain(
      'COUNT("run"."id") FILTER (WHERE "run"."status" NOT IN ($4, $5))',
    );
  });

  it('adds extra aggregates after the status counts', () => {
    const query = buildRunInsightsDailySeriesQuery({
      runsSource: '(SELECT 1) ',
      additionalSelects: ['SUM("run"."credits") AS "credits"'],
      placeholders: POSITIONAL_PLACEHOLDERS,
    });

    expect(query).toContain(
      'AS "otherRunCount",\n      SUM("run"."credits") AS "credits"',
    );
    expect(query).toContain('ON "run"."createdAt" >=');
  });
});
