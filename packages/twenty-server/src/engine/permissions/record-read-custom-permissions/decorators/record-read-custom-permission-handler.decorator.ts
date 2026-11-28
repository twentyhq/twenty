import { SetMetadata } from '@nestjs/common';

import { RECORD_READ_CUSTOM_PERMISSION_HANDLER_METADATA_KEY } from 'src/engine/permissions/record-read-custom-permissions/constants/record-read-custom-permission-handler-metadata-key.constant';

export const RecordReadCustomPermissionHandler = (objectNameSingular: string) =>
  SetMetadata(
    RECORD_READ_CUSTOM_PERMISSION_HANDLER_METADATA_KEY,
    objectNameSingular,
  );
