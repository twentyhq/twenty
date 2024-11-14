export const getWorkspaceSubdomainByOrigin = (
  origin: string,
  frontBaseUrl: string,
) => {
  const { hostname: originHostname } = new URL(origin);
  const { hostname: frontBaseHostname } = new URL(frontBaseUrl);

  if (
    originHostname === frontBaseHostname ||
    originHostname === `app.${frontBaseHostname}`
  )
    return;

  return originHostname.replace(`.${frontBaseHostname}`, '');
};
