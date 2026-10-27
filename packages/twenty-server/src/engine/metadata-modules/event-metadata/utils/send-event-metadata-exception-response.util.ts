import { type Response } from 'express';

import { EventMetadataException } from 'src/engine/metadata-modules/event-metadata/event-metadata.exception';
import { getEventMetadataExceptionHttpStatus } from 'src/engine/metadata-modules/event-metadata/utils/get-event-metadata-exception-http-status.util';

export const sendEventMetadataExceptionResponse = (
  response: Response,
  error: unknown,
): void => {
  if (!(error instanceof EventMetadataException)) {
    throw error;
  }

  response.status(getEventMetadataExceptionHttpStatus(error.code)).json({
    error: error.code,
    message: error.message,
  });
};
