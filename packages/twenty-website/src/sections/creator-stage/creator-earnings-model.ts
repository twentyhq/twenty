// PROTOTYPE the estimator's inputs. Commission and duration are the program's
// own figures; the seat price is the public Cloud Organization price billed
// yearly (sections/pricing-plans/plans-data.ts).
export const CREATOR_EARNINGS_MODEL = {
  commissionRate: 0.2,
  months: 12,
  seatPriceDollars: 39,
  teams: { min: 1, max: 30, initial: 5 },
  seatsPerTeam: { min: 2, max: 50, initial: 10 },
};
