import { isDefined } from 'class-validator';
import { ALL_METADATA_ENTITY_BY_METADATA_NAME } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-entity-by-metadata-name.constant';
import { MetadataEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-entity.type';
import {
  ALL_METADATA_NAME,
  AllMetadataName,
  NotV2YetAllMetadataName,
} from 'twenty-shared/metadata';
import { DataSource, Repository } from 'typeorm';

type MetadataEntityRepositoryByMetadataName = {
  [P in AllMetadataName | NotV2YetAllMetadataName]: Repository<
    InstanceType<(typeof ALL_METADATA_ENTITY_BY_METADATA_NAME)[P]>
  >;
};

export const getAllMetadataEntityRepository = ({
  dataSource,
}: {
  dataSource: DataSource;
}): MetadataEntityRepositoryByMetadataName => {
  const metadataEntityRepositoryByMetadataName =
    {} as MetadataEntityRepositoryByMetadataName;

  for (const metadataName of Object.keys(
    ALL_METADATA_NAME,
  ) as AllMetadataName[]) {
    const currentMetadataEntity =
      ALL_METADATA_ENTITY_BY_METADATA_NAME[metadataName];

    const metadataEntityRepository = dataSource.getRepository<
      MetadataEntity<typeof metadataName>
    >(currentMetadataEntity);

    if (!isDefined(metadataEntityRepository)) {
      throw new Error(
        `Could not find metadata entity repository for ${metadataName}`,
      );
    }

    // @ts-expect-error TODO
    metadataEntityRepositoryByMetadataName[metadataName] =
      metadataEntityRepository;
  }

  return metadataEntityRepositoryByMetadataName;
};
