const { version } = require('../package.json');
import { version as platformVersion } from 'zapier-platform-core';
import createPerson from './creates/create_person';
import createCompany from './creates/create_company';
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
    [createPerson.key]: createPerson,
    [createCompany.key]: createCompany,
    [createObject.key]: createObject,
  },
};
