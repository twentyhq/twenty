import { CREDENTIAL_REQUEST_HEADER_NAMES } from 'src/engine/metadata-modules/logic-function/constants/credential-request-header-names.constant';

export const isCredentialRequestHeaderName = (headerName: string): boolean =>
  CREDENTIAL_REQUEST_HEADER_NAMES.has(headerName.toLowerCase());
