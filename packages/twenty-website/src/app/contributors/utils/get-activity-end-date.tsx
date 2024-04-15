const TOTAL_DAYS_TO_FULL_WIDTH = 232;

export const getActivityEndDate = (
  activityDates: { value: number; day: string }[],
) => {
  const startDate = new Date(activityDates[0].day);
  const endDate = new Date(activityDates[activityDates.length - 1].day);

  const differenceInMilliseconds = endDate.getTime() - startDate.getTime();

  const numberOfDays = Math.floor(
    differenceInMilliseconds / (1000 * 60 * 60 * 24),
  );

  const daysToAdd = TOTAL_DAYS_TO_FULL_WIDTH - numberOfDays;

  if (daysToAdd > 0) {
    endDate.setDate(endDate.getDate() + daysToAdd);
  }

  return endDate;
};
