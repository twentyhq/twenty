import { CronTriggerEntity } from 'src/engine/metadata-modules/cron-trigger/entities/cron-trigger.entity';
import { DatabaseEventTriggerEntity } from 'src/engine/metadata-modules/database-event-trigger/entities/database-event-trigger.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RouteTriggerEntity } from 'src/engine/metadata-modules/route-trigger/route-trigger.entity';
import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { ViewFieldEntity } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';
import { ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';
import { ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { AllMetadataName } from 'twenty-shared/metadata';

// Missing several entities should create a new abstraction called AllMetadataName and AllImportableMetadataName or smthing like that
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
} as const satisfies { [P in AllMetadataName]: unknown }; // Should be MetadataEntity<P> TODO
