import { type I18n } from '@lingui/core';
import { type MetadataValidationErrorResponse } from 'twenty-shared/metadata';

import { type MetadataValidationErrorResponseDescriptor } from 'src/engine/workspace-manager/workspace-migration/interceptors/types/metadata-validation-error-response-descriptor.type';
import { translateUserFriendlyMessageDescriptors } from 'src/engine/workspace-manager/workspace-migration/interceptors/utils/translate-user-friendly-message-descriptors.util';

export const translateMetadataValidationErrorResponse = (
  response: MetadataValidationErrorResponseDescriptor,
  i18n: I18n,
): MetadataValidationErrorResponse =>
  translateUserFriendlyMessageDescriptors(
    response,
    i18n,
  ) as MetadataValidationErrorResponse;
