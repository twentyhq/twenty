// Placeholders are passed in so the query fits both named (:timeZone) and positional ($2) parameters
export type RunInsightsDailySeriesPlaceholders = {
  timeZone: string;
  lastDayOffset: string;
  completedStatus: string;
  failedStatus: string;
};
