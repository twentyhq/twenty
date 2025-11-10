import { isDefined } from 'class-validator';
import {
  ALL_METADATA_NAME,
  type AllMetadataName,
  NOT_V2_YET_METADATA_NAME,
  type NotV2YetAllMetadataName,
} from 'twenty-shared/metadata';
import { type QueryRunner, type Repository } from 'typeorm';

import { ALL_METADATA_ENTITY_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-entity-by-metadata-name.constant';

type MetadataEntityRepositoryByMetadataName = {
  [P in AllMetadataName | NotV2YetAllMetadataName]: Repository<
    InstanceType<(typeof ALL_METADATA_ENTITY_BY_METADATA_NAME)[P]>
  >;
};

// TODO Centralize
const ALL_METADATA_NAME_TO_MIGRATE = [
  ...Object.keys(ALL_METADATA_NAME),
  ...Object.keys(NOT_V2_YET_METADATA_NAME),
] as (AllMetadataName | NotV2YetAllMetadataName)[];
///

export const getAllTransactionalMetadataEntityRepository = ({
  queryRunner,
}: {
  queryRunner: QueryRunner;
}): MetadataEntityRepositoryByMetadataName => {
  const metadataEntityRepositoryByMetadataName =
    {} as MetadataEntityRepositoryByMetadataName;

  for (const metadataName of ALL_METADATA_NAME_TO_MIGRATE) {
    const currentMetadataEntity =
      ALL_METADATA_ENTITY_BY_METADATA_NAME[metadataName];

    const metadataEntityRepository = queryRunner.manager.getRepository(
      currentMetadataEntity,
    );

    if (!isDefined(metadataEntityRepository)) {
      throw new Error(
        `Could not find metadata entity repository for ${metadataName}`,
      );
    }

    // @ts-expect-error Union type overlaping
    metadataEntityRepositoryByMetadataName[metadataName] =
      metadataEntityRepository;
  }

  return metadataEntityRepositoryByMetadataName;
};
