import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type SharingRuleEntity } from 'src/engine/metadata-modules/sharing-rule/entities/sharing-rule.entity';

export type FlatSharingRule = FlatEntityFrom<SharingRuleEntity>;
