const { version } = require('../package.json');
import { version as platformVersion } from 'zapier-platform-core';
import createObject from './creates/create_object';
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
    [createObject.key]: createObject,
  },
};
