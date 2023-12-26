const fs = require("fs");
const semver = require("semver");
const path = require("path");

// Get the version argument from the command line
const [, , version] = process.argv;

if (!semver.valid(version)) {
  console.error(
    "Invalid version. The format should be X.X.X where X is a positive integer (or 0)."
  );
  process.exit(1);
}

const FrontPackageJson = path.join(__dirname, "../twenty-front/package.json");
const ServerPackageJson = path.join(__dirname, "../twenty-server/package.json");

// Update package.json
for (let file of [FrontPackageJson, ServerPackageJson]) {
  let pkgdata = JSON.parse(fs.readFileSync(file));
  pkgdata.version = version;
  fs.writeFileSync(file, JSON.stringify(pkgdata, null, 2), "utf8");
}
