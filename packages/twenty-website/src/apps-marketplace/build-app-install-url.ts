const TWENTY_APP_BASE_URL = 'https://app.twenty.com';

export const buildAppInstallUrl = (universalIdentifier: string): string =>
  `${TWENTY_APP_BASE_URL}/settings/applications/available/${universalIdentifier}`;
