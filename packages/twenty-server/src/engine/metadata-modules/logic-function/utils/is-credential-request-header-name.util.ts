import { isDefined } from 'twenty-shared/utils';

import { CREDENTIAL_REQUEST_HEADER_NAMES } from 'src/engine/metadata-modules/logic-function/constants/credential-request-header-names.constant';

export const isCredentialRequestHeaderName = ({
  headerName,
  identityAssertionHeaderName,
}: {
  headerName: string;
  identityAssertionHeaderName: string | undefined;
}): boolean => {
  const lowercaseHeaderName = headerName.toLowerCase();

  return (
    CREDENTIAL_REQUEST_HEADER_NAMES.has(lowercaseHeaderName) ||
    (isDefined(identityAssertionHeaderName) &&
      lowercaseHeaderName === identityAssertionHeaderName.toLowerCase())
  );
};
