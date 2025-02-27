// @ts-check
/** @type {import('@yarnpkg/types')} */
const { defineConfig, Yarn } = require('@yarnpkg/types');
const semver = require('semver');

const MONOREPO_ROOT_WORKSPACE = 'twenty';

module.exports = defineConfig({
  async constraints({ Yarn }) {
    const rootWorkspace = Yarn.workspace({ ident: MONOREPO_ROOT_WORKSPACE });
    if (!rootWorkspace) {
      throw new Error(
        `Should never occurs, ${MONOREPO_ROOT_WORKSPACE} workspace not found`,
      );
    }

    const currentNodeVersion = process.version;
    const requiredNodeVersion = rootWorkspace.manifest.engines?.node;
    if (!semver.satisfies(currentNodeVersion, requiredNodeVersion)) {
      throw new Error("Node version doesn't match the required version");
    }
  },
});
