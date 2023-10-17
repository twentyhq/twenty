const authentication = require('./authentication');
const createPersonCreate = require('./creates/create_person.js');

module.exports = {
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,
  authentication: authentication,
  creates: { [createPersonCreate.key]: createPersonCreate },
};
