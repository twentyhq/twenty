import { version as platformVersion } from 'zapier-platform-core';

import 'dotenv/config';

const { version } = require('../package.json');

import createRecord, { createRecordKey } from './creates/create_record';
import deleteRecord, { deleteRecordKey } from './creates/delete_record';
import updateRecord, { updateRecordKey } from './creates/update_record';
import findObjectNamesPlural, {
  findObjectNamesPluralKey,
} from './triggers/find_object_names_plural';
import findObjectNamesSingular, {
  findObjectNamesSingularKey,
} from './triggers/find_object_names_singular';
import listRecordIds, { listRecordIdsKey } from './triggers/list_record_ids';
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

export default {
  version,
  platformVersion,
  authentication: authentication,
  triggers: {
    [findObjectNamesSingularKey]: findObjectNamesSingular,
    [findObjectNamesPluralKey]: findObjectNamesPlural,
    [listRecordIdsKey]: listRecordIds,
    [triggerRecordCreatedKey]: triggerRecordCreated,
    [triggerRecordUpdatedKey]: triggerRecordUpdated,
    [triggerRecordDeletedKey]: triggerRecordDeleted,
  },
  creates: {
    [createRecordKey]: createRecord,
    [updateRecordKey]: updateRecord,
    [deleteRecordKey]: deleteRecord,
  },
};
