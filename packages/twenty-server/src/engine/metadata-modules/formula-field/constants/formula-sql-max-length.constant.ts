// Some functions repeat their input in the SQL they produce, so nesting them grows the SQL exponentially
export const FORMULA_SQL_MAX_LENGTH = 100_000;
