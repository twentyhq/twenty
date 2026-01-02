import { type FlatSkill } from 'src/engine/metadata-modules/flat-skill/types/flat-skill.type';
import { type FlatEntityPropertiesUpdates } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-properties-updates.type';

export type UpdateSkillAction = {
  type: 'update_skill';
  flatEntityId: string;
  flatEntityUpdates: FlatEntityPropertiesUpdates<'skill'>;
};

export type CreateSkillAction = {
  type: 'create_skill';
  flatEntity: FlatSkill;
};

export type DeleteSkillAction = {
  type: 'delete_skill';
  flatEntityId: string;
};
