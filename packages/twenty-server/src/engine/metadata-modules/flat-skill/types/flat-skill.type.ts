import { type SkillEntity } from 'src/engine/metadata-modules/skill/entities/skill.entity';
import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';

export const skillEntityRelationProperties = [
  'workspace',
  'application',
] as const;

export type SkillEntityRelationProperties =
  (typeof skillEntityRelationProperties)[number];

export type FlatSkill = FlatEntityFrom<
  SkillEntity,
  SkillEntityRelationProperties
>;
