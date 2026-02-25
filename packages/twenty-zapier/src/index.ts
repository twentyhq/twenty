import { version as platformVersion } from 'zapier-platform-core';

import 'dotenv/config';

import { version } from '../package.json';

import crudRecord, { crudRecordKey } from 'src/creates/crud_record';
import findObjectNamesSingular, {
  findObjectNamesSingularKey,
} from 'src/triggers/find_object_names_singular';
import listRecordIds, { listRecordIdsKey } from 'src/triggers/list_record_ids';
import triggerRecord, { triggerRecordKey } from 'src/triggers/trigger_record';
import authentication from 'src/authentication';

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
