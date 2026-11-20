// TODO(@jocelyncaron): confirm the estimate's price and constants with the content owner.
export const INTEGRATOR_LEDGER: {
  commissionRate: number;
  months: number;
  seatPricePerMonth: number;
  minSeats: number;
  maxSeats: number;
  defaultSeats: number;
  seatStep: number;
} = {
  commissionRate: 0.2,
  months: 12,
  seatPricePerMonth: 39,
  minSeats: 5,
  maxSeats: 300,
  defaultSeats: 60,
  seatStep: 5,
};
