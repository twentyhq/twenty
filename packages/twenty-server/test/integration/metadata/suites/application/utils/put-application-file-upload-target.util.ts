import request from 'supertest';

import { type ApplicationFileUploadTarget } from 'test/integration/metadata/suites/application/utils/create-application-file-uploads.util';

export const putApplicationFileUploadTarget = ({
  uploadTarget,
  body,
}: {
  uploadTarget: Pick<ApplicationFileUploadTarget, 'uploadUrl' | 'contentType'>;
  body: Buffer;
}) => {
  const { pathname, search } = new URL(uploadTarget.uploadUrl);

  return request(`http://localhost:${APP_PORT}`)
    .put(`${pathname}${search}`)
    .set('Content-Type', uploadTarget.contentType)
    .send(body);
};
