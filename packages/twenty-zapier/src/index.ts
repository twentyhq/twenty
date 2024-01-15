import { version as platformVersion } from 'zapier-platform-core';

import 'dotenv/config';

const { version } = require('../package.json');

import createRecord, { createRecordKey } from './creates/create_record';
import crudRecord, { crudRecordKey } from './creates/create_record_2';
import deleteRecord, { deleteRecordKey } from './creates/delete_record';
import updateRecord, { updateRecordKey } from './creates/update_record';
import findObjectNamesPlural, {
  findObjectNamesPluralKey,
} from './triggers/find_object_names_plural';
import findObjectNamesSingular, {
  findObjectNamesSingularKey,
} from './triggers/find_object_names_singular';
import triggerRecord, { triggerRecordKey } from './triggers/trigger_record';
import authentication from './authentication';

export default {
  version,
  platformVersion,
  authentication: authentication,
  triggers: {
    [findObjectNamesSingularKey]: findObjectNamesSingular,
    [findObjectNamesPluralKey]: findObjectNamesPlural,
    [triggerRecordKey]: triggerRecord,
  },
  creates: {
    [createRecordKey]: createRecord,
    [updateRecordKey]: updateRecord,
    [deleteRecordKey]: deleteRecord,
    [crudRecordKey]: crudRecord,
  },
};
