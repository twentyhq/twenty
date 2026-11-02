import { Raw } from 'typeorm';

export const buildToolCallStatusWhere = (status: string) =>
  Raw((column) => `${column}->'result'->>'status' = :toolCallStatus`, {
    toolCallStatus: status,
  });
