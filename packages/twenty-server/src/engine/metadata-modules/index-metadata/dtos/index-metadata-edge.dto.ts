import { IndexMetadataDTO } from 'src/engine/metadata-modules/index-metadata/dtos/index-metadata.dto';
import { createCursorEdgeType } from 'src/engine/metadata-modules/pagination/dtos/cursor-connection-type.factory';

export const IndexEdgeDTO = createCursorEdgeType(
  IndexMetadataDTO,
  'Index',
  'IndexEdge',
);
