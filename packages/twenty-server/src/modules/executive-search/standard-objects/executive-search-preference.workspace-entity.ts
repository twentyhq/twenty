import { type RichTextMetadata } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type ExecutiveProfileWorkspaceEntity } from 'src/modules/executive-search/standard-objects/executive-profile.workspace-entity';
import { type TravelWillingness } from 'src/modules/executive-search/common/enums/travel-willingness.enum';
import { type Availability } from 'src/modules/executive-search/common/enums/availability.enum';

export class ExecutiveSearchPreferenceWorkspaceEntity extends BaseWorkspaceEntity {
  executiveProfile: EntityRelation<ExecutiveProfileWorkspaceEntity> | null;
  executiveProfileId: string | null;
  boardTypes: string | null;
  industries: string | null;
  companySizes: string | null;
  preferredLocations: string | null;
  openToRelocation: boolean;
  travelWillingness: TravelWillingness;
  availability: Availability;
  compensationExpectation: number | null;
  notes: RichTextMetadata | null;
}
