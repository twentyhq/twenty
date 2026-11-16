import { type RunInsightsDailySeriesPlaceholders } from 'src/engine/utils/run-insights/run-insights-daily-series-placeholders.type';

export const buildRunInsightsWindowFirstLocalDay = ({
  timeZone,
  lastDayOffset,
}: Pick<RunInsightsDailySeriesPlaceholders, 'timeZone' | 'lastDayOffset'>) =>
  `DATE_TRUNC('day', NOW() AT TIME ZONE ${timeZone}) - MAKE_INTERVAL(days => ${lastDayOffset}::int)`;
