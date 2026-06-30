import { execSync } from 'child_process';
import * as path from 'path';
import { fileURLToPath } from 'url';

const MAX_UNPACKED_BYTES = 30 * 1024 * 1024;
const PACKAGE_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);

const formatMegabytes = (bytes: number) =>
  `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

type NpmPackResult = {
  filename: string;
  size: number;
  unpackedSize: number;
  entryCount: number;
};

const output = execSync('npm pack --dry-run --json', {
  cwd: PACKAGE_PATH,
  encoding: 'utf-8',
  maxBuffer: 64 * 1024 * 1024,
});

const [packResult] = JSON.parse(output) as NpmPackResult[];
if (packResult === undefined) {
  throw new Error('npm pack did not return any package information');
}

const { size, unpackedSize, entryCount } = packResult;

if (unpackedSize > MAX_UNPACKED_BYTES) {
  process.stderr.write(
    `twenty-ui unpacked size ${formatMegabytes(unpackedSize)} exceeds budget ${formatMegabytes(
      MAX_UNPACKED_BYTES,
    )} (tarball ${formatMegabytes(size)}, ${entryCount} files)\n`,
  );
  process.exit(1);
}

process.stdout.write(
  `twenty-ui pack OK: tarball ${formatMegabytes(size)}, unpacked ${formatMegabytes(
    unpackedSize,
  )}, ${entryCount} files\n`,
);
