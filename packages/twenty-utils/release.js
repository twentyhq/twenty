const fs = require('fs');
const semver = require('semver');
const path = require('path');

// Get the version argument from the command line
const [, , version] = process.argv;

if (!semver.valid(version)) {
  console.error(
    'Invalid version. The format should be X.X.X where X is a positive integer (or 0).',
  );
  process.exit(1);
}

const frontPackageJson = path.join(__dirname, '../twenty-front/package.json');
const serverPackageJson = path.join(__dirname, '../twenty-server/package.json');
const emailPackageJson = path.join(__dirname, '../twenty-emails/package.json');

// Update package.json
for (let file of [
  frontPackageJson,
  serverPackageJson,
  docsPackageJson,
  emailPackageJson,
]) {
  let pkgdata = JSON.parse(fs.readFileSync(file));
  pkgdata.version = version;
  fs.writeFileSync(file, JSON.stringify(pkgdata, null, 2), 'utf8');
}
