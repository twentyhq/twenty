import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

// Regenerates the core client inside an installed twenty-client-sdk package,
// exactly like the twenty-sdk CLI does for app developers
// (ClientService.generateCoreClient -> replaceCoreClient).
//
// Usage: node generate-client.mjs <consumer-dir> <schema-file.graphql>
const [consumerDir, schemaPath] = process.argv.slice(2);

if (!consumerDir || !schemaPath) {
  throw new Error('Usage: node generate-client.mjs <consumer-dir> <schema-file.graphql>');
}

const packageRoot = resolve(consumerDir, 'node_modules', 'twenty-client-sdk');
const generateModuleUrl = pathToFileURL(join(packageRoot, 'dist', 'generate.mjs'));

const { replaceCoreClient } = await import(generateModuleUrl.href);
const schema = await readFile(schemaPath, 'utf-8');

await replaceCoreClient({ packageRoot, schema });
console.log(`Regenerated core client in ${packageRoot} from ${schemaPath}`);
