import { type FlatSkill } from 'src/engine/metadata-modules/flat-skill/types/flat-skill.type';

export const FLAT_SKILL_EDITABLE_PROPERTIES = [
  'name',
  'label',
  'icon',
  'description',
  'content',
  'isActive',
] as const satisfies (keyof FlatSkill)[];
