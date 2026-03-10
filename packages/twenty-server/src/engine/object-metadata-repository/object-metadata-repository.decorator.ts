import { Inject } from '@nestjs/common';

import { capitalize } from 'twenty-shared/utils';

import { convertClassNameToObjectMetadataName } from 'src/engine/workspace-manager/utils/convert-class-to-object-metadata-name.util';

// oxlint-disable-next-line @typescripttypescript/no-explicit-any
export const InjectObjectMetadataRepository = (objectMetadata: any) => {
  const token = `${capitalize(
    convertClassNameToObjectMetadataName(objectMetadata.name),
  )}Repository`;

  return Inject(token);
};
