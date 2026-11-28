import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { type DocumentNode } from 'graphql';
import { isDefined } from 'twenty-shared/utils';

const FRONT_GENERATED_METADATA_GRAPHQL_PATH = resolve(
  __dirname,
  '../../../../../twenty-front/src/generated-metadata/graphql.ts',
);

// Read from the generated file so a test follows the fragments the front ships
export const readFrontMetadataDocument = (
  documentName:
    | 'GetCurrentUser'
    | 'ObjectMetadataItems'
    | 'FindMinimalMetadata'
    | 'FindManyViews',
): DocumentNode => {
  const documentDeclaration = `export const ${documentName}Document = `;
  const declaration = readFileSync(
    FRONT_GENERATED_METADATA_GRAPHQL_PATH,
    'utf8',
  )
    .split('\n')
    .find((line) => line.startsWith(documentDeclaration));

  if (!isDefined(declaration)) {
    throw new Error(
      `${documentName}Document not found in ${FRONT_GENERATED_METADATA_GRAPHQL_PATH}`,
    );
  }

  return JSON.parse(
    declaration.slice(
      documentDeclaration.length,
      declaration.lastIndexOf(' as unknown as DocumentNode'),
    ),
  );
};
