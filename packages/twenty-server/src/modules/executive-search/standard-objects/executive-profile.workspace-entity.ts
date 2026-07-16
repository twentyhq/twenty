import { type RichTextMetadata } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { type ProfileStatus } from 'src/modules/executive-search/common/enums/profile-status.enum';
import { type ExecutiveCareerExperienceWorkspaceEntity } from 'src/modules/executive-search/standard-objects/executive-career-experience.workspace-entity';
import { type ExecutiveEducationWorkspaceEntity } from 'src/modules/executive-search/standard-objects/executive-education.workspace-entity';
import { type ExecutiveBoardServiceWorkspaceEntity } from 'src/modules/executive-search/standard-objects/executive-board-service.workspace-entity';
import { type ExecutiveCapabilityWorkspaceEntity } from 'src/modules/executive-search/standard-objects/executive-capability.workspace-entity';
import { type ExecutiveLanguageWorkspaceEntity } from 'src/modules/executive-search/standard-objects/executive-language.workspace-entity';
import { type ExecutiveArtifactWorkspaceEntity } from 'src/modules/executive-search/standard-objects/executive-artifact.workspace-entity';
import { type ExecutiveAwardWorkspaceEntity } from 'src/modules/executive-search/standard-objects/executive-award.workspace-entity';
import { type ExecutiveExternalProfileWorkspaceEntity } from 'src/modules/executive-search/standard-objects/executive-external-profile.workspace-entity';
import { type ExecutiveSearchPreferenceWorkspaceEntity } from 'src/modules/executive-search/standard-objects/executive-search-preference.workspace-entity';

export class ExecutiveProfileWorkspaceEntity extends BaseWorkspaceEntity {
  headline: string | null;
  summary: RichTextMetadata | null;
  profileStatus: ProfileStatus;
  yearsOfExperience: number | null;
  currentTitle: string | null;
  location: string | null;
  isBoardReady: boolean;
  lastVerifiedAt: string | null;
  person: EntityRelation<PersonWorkspaceEntity>;
  personId: string;
  careerExperiences: EntityRelation<ExecutiveCareerExperienceWorkspaceEntity[]>;
  educations: EntityRelation<ExecutiveEducationWorkspaceEntity[]>;
  boardServices: EntityRelation<ExecutiveBoardServiceWorkspaceEntity[]>;
  capabilities: EntityRelation<ExecutiveCapabilityWorkspaceEntity[]>;
  languages: EntityRelation<ExecutiveLanguageWorkspaceEntity[]>;
  artifacts: EntityRelation<ExecutiveArtifactWorkspaceEntity[]>;
  awards: EntityRelation<ExecutiveAwardWorkspaceEntity[]>;
  externalProfiles: EntityRelation<ExecutiveExternalProfileWorkspaceEntity[]>;
  searchPreferences: EntityRelation<ExecutiveSearchPreferenceWorkspaceEntity[]>;
}
