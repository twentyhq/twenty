export const expectNotInternalServerErrorSsoRedirectSnapshot = (
  redirectUrl: URL,
) => {
  const errorMessage = redirectUrl.searchParams.get('errorMessage');

  expect(errorMessage).not.toMatch(/^Authentication error:/);

  expect({
    pathname: redirectUrl.pathname,
    loginToken: redirectUrl.searchParams.get('loginToken'),
    errorMessage,
  }).toMatchSnapshot();
};
