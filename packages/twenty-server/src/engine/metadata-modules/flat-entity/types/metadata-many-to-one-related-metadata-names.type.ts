import { type AllMetadataName } from 'twenty-shared/metadata';

import { type ALL_METADATA_RELATED_METADATA_BY_FOREIGN_KEY } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-many-to-one-relations.constant';
import { type MetadataManyToOneJoinColumn } from 'src/engine/metadata-modules/flat-entity/types/metadata-many-to-one-join-column.type';

export type MetadataManyToOneRelatedMetadataNames<T extends AllMetadataName> =
  Extract<
    (typeof ALL_METADATA_RELATED_METADATA_BY_FOREIGN_KEY)[T][MetadataManyToOneJoinColumn<T>],
    { metadataName: AllMetadataName }
  >['metadataName'];
