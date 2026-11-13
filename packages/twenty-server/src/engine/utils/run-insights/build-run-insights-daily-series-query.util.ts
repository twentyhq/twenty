// Placeholders are passed in so the query fits both named (:timeZone) and positional ($2) parameters
type RunInsightsDailySeriesPlaceholders = {
  timeZone: string;
  lastDayOffset: string;
  completedStatus: string;
  failedStatus: string;
};

export const buildRunInsightsWindowFirstLocalDay = ({
  timeZone,
  lastDayOffset,
}: Pick<RunInsightsDailySeriesPlaceholders, 'timeZone' | 'lastDayOffset'>) =>
  `DATE_TRUNC('day', NOW() AT TIME ZONE ${timeZone}) - MAKE_INTERVAL(days => ${lastDayOffset}::int)`;

// One row per local calendar day of the window, oldest first, counting the runs created that day
export const buildRunInsightsDailySeriesQuery = ({
  runsSource,
  runsSourceCondition,
  additionalSelects = [],
  placeholders,
}: {
  runsSource: string;
  runsSourceCondition?: string;
  additionalSelects?: string[];
  placeholders: RunInsightsDailySeriesPlaceholders;
}) => {
  const { timeZone, completedStatus, failedStatus } = placeholders;
  const windowFirstLocalDay = buildRunInsightsWindowFirstLocalDay(placeholders);

  return `
    SELECT
      TO_CHAR("calendarDay"."day", 'YYYY-MM-DD') AS "day",
      COUNT("run"."id") FILTER (WHERE "run"."status" = ${completedStatus}) AS "completedRunCount",
      COUNT("run"."id") FILTER (WHERE "run"."status" = ${failedStatus}) AS "failedRunCount",
      COUNT("run"."id") FILTER (WHERE "run"."status" NOT IN (${completedStatus}, ${failedStatus})) AS "otherRunCount"${additionalSelects.map((select) => `,\n      ${select}`).join('')}
    FROM GENERATE_SERIES(
      ${windowFirstLocalDay},
      DATE_TRUNC('day', NOW() AT TIME ZONE ${timeZone}),
      INTERVAL '1 day'
    ) AS "calendarDay"("day")
    LEFT JOIN ${runsSource} AS "run"
      ON ${runsSourceCondition ? `${runsSourceCondition} AND ` : ''}"run"."createdAt" >= (${windowFirstLocalDay}) AT TIME ZONE ${timeZone}
      AND DATE_TRUNC('day', "run"."createdAt" AT TIME ZONE ${timeZone}) = "calendarDay"."day"
    GROUP BY "calendarDay"."day"
    ORDER BY "calendarDay"."day"`;
};
