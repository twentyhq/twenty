const { version } = require('../package.json');
import { version as platformVersion } from 'zapier-platform-core';
import createPerson from './creates/create_person';
import authentication from './authentication';

export default {
  version,
  platformVersion,
  authentication: authentication,
  creates: { [createPerson.key]: createPerson },
};
