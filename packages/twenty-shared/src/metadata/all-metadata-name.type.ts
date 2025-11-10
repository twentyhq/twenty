import {
    NOT_V2_YET_METADATA_NAME,
    type ALL_METADATA_NAME,
} from '@/metadata/all-metadata-name.constant';

export type AllMetadataName = keyof typeof ALL_METADATA_NAME;

export type NotV2YetAllMetadataName = keyof typeof NOT_V2_YET_METADATA_NAME;
