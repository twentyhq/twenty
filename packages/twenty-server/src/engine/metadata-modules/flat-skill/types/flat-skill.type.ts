import { type SkillEntity } from 'src/engine/metadata-modules/skill/entities/skill.entity';
import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';

export type FlatSkill = FlatEntityFrom<SkillEntity>;
