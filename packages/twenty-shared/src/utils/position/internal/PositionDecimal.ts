import Decimal from 'decimal.js-light';

// Doubles need up to 17 significant digits, so 40 keeps intermediate rounding
// far below double precision until toNumber() rounds back to a double
export const PositionDecimal = Decimal.clone({ precision: 40 });
