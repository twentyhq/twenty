import { FieldMetadataOptionEntity } from 'src/engine/metadata-modules/field-metadata-option/entities/field-metadata-option.entity';
import { UpgradeAwareRepositoryState } from 'src/engine/twenty-orm/upgrade-aware/upgrade-aware-repository-state';

// Earlier upgrade steps still create enum fields before the option table exists.
export const isFieldMetadataOptionEntityAvailable = (): boolean =>
  UpgradeAwareRepositoryState.getInstance().isEntityAvailable(
    FieldMetadataOptionEntity,
  );
