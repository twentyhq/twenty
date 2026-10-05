import { FieldEdgeDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata-connection.dto';
import { IndexEdgeDTO } from 'src/engine/metadata-modules/index-metadata/dtos/index-metadata-edge.dto';
import { ObjectMetadataDTO } from 'src/engine/metadata-modules/object-metadata/dtos/object-metadata.dto';
import {
  createCursorConnectionType,
  createCursorEdgeType,
} from 'src/engine/metadata-modules/pagination/dtos/cursor-connection-type.factory';

export const ObjectEdgeDTO = createCursorEdgeType(
  ObjectMetadataDTO,
  'Object',
  'ObjectEdge',
);

export const ObjectConnectionDTO = createCursorConnectionType(
  ObjectEdgeDTO,
  'ObjectConnection',
);

export const ObjectFieldsConnectionDTO = createCursorConnectionType(
  FieldEdgeDTO,
  'ObjectFieldsConnection',
);

export const ObjectIndexMetadatasConnectionDTO = createCursorConnectionType(
  IndexEdgeDTO,
  'ObjectIndexMetadatasConnection',
);
