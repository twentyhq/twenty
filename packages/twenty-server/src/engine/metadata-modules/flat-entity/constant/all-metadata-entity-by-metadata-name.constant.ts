import {
  type AllMetadataName,
  type NotV2YetAllMetadataName,
} from 'twenty-shared/metadata';

import { AgentEntity } from 'src/engine/metadata-modules/agent/agent.entity';
import { CronTriggerEntity } from 'src/engine/metadata-modules/cron-trigger/entities/cron-trigger.entity';
import { DatabaseEventTriggerEntity } from 'src/engine/metadata-modules/database-event-trigger/entities/database-event-trigger.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { RouteTriggerEntity } from 'src/engine/metadata-modules/route-trigger/route-trigger.entity';
import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { ViewFilterGroupEntity } from 'src/engine/metadata-modules/view-filter-group/entities/view-filter-group.entity';
import { ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';
import { ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';
import { ViewSortEntity } from 'src/engine/metadata-modules/view-sort/entities/view-sort.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';

export const ALL_METADATA_ENTITY_BY_METADATA_NAME = {
  cronTrigger: CronTriggerEntity,
  databaseEventTrigger: DatabaseEventTriggerEntity,
  fieldMetadata: FieldMetadataEntity,
  index: IndexMetadataEntity,
  objectMetadata: ObjectMetadataEntity,
  routeTrigger: RouteTriggerEntity,
  serverlessFunction: ServerlessFunctionEntity,
  view: ViewEntity,
  viewField: ViewFieldEntity,
  viewFilter: ViewFilterEntity,
  viewGroup: ViewGroupEntity,

  // Not v2 yet
  agent: AgentEntity,
  role: RoleEntity,
  viewFilterGroup: ViewFilterGroupEntity,
  viewSort: ViewSortEntity,
  ///
} as const satisfies {
  [P in AllMetadataName | NotV2YetAllMetadataName]: unknown;
}; // TODO Long term should be MetadataEntity<P>
