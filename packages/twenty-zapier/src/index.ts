import { version as platformVersion } from 'zapier-platform-core';

import 'dotenv/config';

const { version } = require('../package.json');

import crudRecord, { crudRecordKey } from './creates/crud_record';
import findObjectNamesSingular, {
  findObjectNamesSingularKey,
} from './triggers/find_object_names_singular';
import listRecordIds, { listRecordIdsKey } from './triggers/list_record_ids';
import triggerRecord, { triggerRecordKey } from './triggers/trigger_record';
import authentication from './authentication';

export default {
  version,
  platformVersion,
  authentication: authentication,
  triggers: {
    [findObjectNamesSingularKey]: findObjectNamesSingular,
    [listRecordIdsKey]: listRecordIds,
    [triggerRecordKey]: triggerRecord,
  },
  creates: {
    [crudRecordKey]: crudRecord,
  },
};
