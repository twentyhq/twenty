// Temporary quick workaround until we eject from nestjs-query that seems to convert date to string and vice-versa
export const transpileToDateIfNot = (dateToVerify: string | Date): Date =>
  dateToVerify instanceof Date ? dateToVerify : new Date(dateToVerify);
