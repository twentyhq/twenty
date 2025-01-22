import { Response } from 'express';

export const writeResponseOnExceptionCaught = (
  res: Response,
  error: any,
  source: 'rest' | 'graphql',
  errors: any[],
) => {
  res.writeHead(
    source === 'graphql'
      ? 200
      : error instanceof Error
        ? 500
        : error.status || 500,
    { 'Content-Type': 'application/json' },
  );
  res.write(
    JSON.stringify({
      errors,
    }),
  );
  res.end();
};
