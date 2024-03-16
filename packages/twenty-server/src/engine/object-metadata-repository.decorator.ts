import { Inject } from '@nestjs/common';

import { convertClassNameToObjectMetadataName } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/convert-class-to-object-metadata-name.util';

export const InjectObjectMetadataRepository = (entity: any) => {
  const token = `${convertClassNameToObjectMetadataName(
    entity.name,
  )}Repository`;

  return Inject(token);
};
