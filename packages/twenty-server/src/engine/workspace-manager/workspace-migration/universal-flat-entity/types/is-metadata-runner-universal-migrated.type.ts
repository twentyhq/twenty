import { AllFlatEntityTypesByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-types-by-metadata-name';
import { AllMetadataName } from 'twenty-shared/metadata';

export type IsMetadataRunnerUniversalMigrated<T extends AllMetadataName> =
  AllFlatEntityTypesByMetadataName[T] extends {
    universalMigrated: {
      runner: true;
    };
  }
    ? true
    : false;
