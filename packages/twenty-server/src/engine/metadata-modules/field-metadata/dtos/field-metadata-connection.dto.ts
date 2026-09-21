import { FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import {
  createCursorConnectionType,
  createCursorEdgeType,
} from 'src/engine/metadata-modules/pagination/dtos/cursor-connection-type.factory';

export const FieldEdgeDTO = createCursorEdgeType(
  FieldMetadataDTO,
  'Field',
  'FieldEdge',
);

export const FieldConnectionDTO = createCursorConnectionType(
  FieldEdgeDTO,
  'FieldConnection',
);
