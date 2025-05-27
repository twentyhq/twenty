import { Inject } from '@nestjs/common';

import { capitalize } from 'twenty-shared/utils';

import { convertClassNameToObjectMetadataName } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/convert-class-to-object-metadata-name.util';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const InjectObjectMetadataRepository = (objectMetadata: any) => {
  const token = `${capitalize(
    convertClassNameToObjectMetadataName(objectMetadata.name),
  )}Repository`;

  return Inject(token);
};
