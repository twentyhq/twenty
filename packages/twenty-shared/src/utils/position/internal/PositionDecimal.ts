import Decimal from 'decimal.js-light';

// Doubles need up to 17 significant digits, so 40 keeps intermediate results
// exact before they are rounded back to a double by toNumber()
export const PositionDecimal = Decimal.clone({ precision: 40 });
