const { version } = require('../package.json');
import { version as platformVersion } from 'zapier-platform-core';
import createRecord from './creates/create_record';
import findObjects from './triggers/find_objects'
import authentication from './authentication';
import 'dotenv/config';

export default {
  version,
  platformVersion,
  authentication: authentication,
  triggers: {
    [findObjects.key]: findObjects,
  },
  creates: {
    [createRecord.key]: createRecord,
  },
};
