const authentication = require('./authentication');
const createPeopleCreate = require('./creates/create_people.js');

module.exports = {
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,
  authentication: authentication,
  creates: { [createPeopleCreate.key]: createPeopleCreate },
};
