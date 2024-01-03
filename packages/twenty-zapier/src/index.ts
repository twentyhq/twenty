import findObjectNamesPlural, {
  findObjectNamesPluralKey,
} from './triggers/find_object_names_plural';

const { version } = require('../package.json');
import { version as platformVersion } from 'zapier-platform-core';
import createRecord, { createRecordKey } from './creates/create_record';
import findObjectNamesSingular, {
  findObjectNamesSingularKey,
} from './triggers/find_object_names_singular';
import triggerRecordCreated, {
  triggerRecordCreatedKey,
} from './triggers/trigger_record_created';
import triggerRecordDeleted, {
  triggerRecordDeletedKey,
} from './triggers/trigger_record_deleted';
import triggerRecordUpdated, {
  triggerRecordUpdatedKey,
} from './triggers/trigger_record_updated';
import authentication from './authentication';
import 'dotenv/config';

export default {
  version,
  platformVersion,
  authentication: authentication,
  triggers: {
    [findObjectNamesSingularKey]: findObjectNamesSingular,
    [findObjectNamesPluralKey]: findObjectNamesPlural,
    [triggerRecordCreatedKey]: triggerRecordCreated,
    [triggerRecordUpdatedKey]: triggerRecordUpdated,
    [triggerRecordDeletedKey]: triggerRecordDeleted,
  },
  creates: {
    [createRecordKey]: createRecord,
  },
};
