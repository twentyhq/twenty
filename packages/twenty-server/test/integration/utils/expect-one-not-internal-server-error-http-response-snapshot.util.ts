// REST counterpart of `expectOneNotInternalServerErrorSnapshot`.
export const expectOneNotInternalServerErrorHttpResponseSnapshot = ({
  status,
  body,
}: {
  status: number;
  body: Record<string, unknown>;
}) => {
  expect(status).not.toBe(500);
  expect(body.code).not.toBe('INTERNAL_SERVER_ERROR');

  expect({ status, body }).toMatchSnapshot();
};
