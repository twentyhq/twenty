import { FeatureFlagKeys } from 'src/engine/modules/feature-flag/feature-flag.entity';

export type FeatureFlagMap = Record<`${FeatureFlagKeys}`, boolean>;
