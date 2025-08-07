import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';

import { INTROSPECTION_QUERY } from './introspection-query';
import {
  type Field,
  type InputValue,
  type IntrospectionResponse,
  type TypeRef,
} from './introspection.interface';

const GRAPHQL_URL = 'http://localhost:3000/graphql';
const BEARER_TOKEN =
  'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyMDIwMjAyMC05ZTNiLTQ2ZDQtYTU1Ni04OGI5ZGRjMmIwMzQiLCJ3b3Jrc3BhY2VJZCI6IjIwMjAyMDIwLTFjMjUtNGQwMi1iZjI1LTZhZWNjZjdlYTQxOSIsIndvcmtzcGFjZU1lbWJlcklkIjoiMjAyMDIwMjAtMDY4Ny00YzQxLWI3MDctZWQxYmZjYTk3MmE3IiwiaWF0IjoxNzI2NDkyNTAyLCJleHAiOjEzMjQ1MDE2NTAyfQ.zM6TbfeOqYVH5Sgryc2zf02hd9uqUOSL1-iJlMgwzsI';
const TEST_OUTPUT_DIR = './test/integration/graphql/suites/object-generated';

const fetchGraphQLSchema = async (): Promise<IntrospectionResponse> => {
  const headers = {
    Authorization: BEARER_TOKEN,
    'Content-Type': 'application/json',
  };
  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query: INTROSPECTION_QUERY }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch schema: ${response.statusText}`);
  }

  return response.json();
};

const toKebabCase = (name: string): string => {
  return name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
};

const unwrapType = (typeInfo: TypeRef): any => {
  while (typeInfo.ofType) {
    typeInfo = typeInfo.ofType;
  }

  return typeInfo;
};

const hasRequiredArgs = (args: InputValue[]): boolean => {
  return args.some((arg) => unwrapType(arg.type).kind === 'NON_NULL');
};

const generateTestContent = (
  queryName: string,
  fields: Field[],
): string | null => {
  const fieldNames = fields
    .filter((f) => ['SCALAR', 'ENUM'].includes(unwrapType(f.type).kind))
    .map((f) => f.name);

  if (fieldNames.length === 0) {
    // eslint-disable-next-line no-console
    console.log(`Skipping ${queryName}: No usable fields found.`);

    return null;
  }

  const fieldSelection = fieldNames.join('\n                ');
  const expectSelection = fieldNames
    .map((f) => `expect(${queryName}).toHaveProperty('${f}');`)
    .join('\n          ');

  return `import request from 'supertest';

const client = request(\`http://localhost:\${APP_PORT}\`);

describe('${queryName}Resolver (e2e)', () => {
  it('should find many ${queryName}', () => {
    const queryData = {
      query: \`
        query ${queryName} {
          ${queryName} {
            edges {
              node {
                ${fieldSelection}
              }
            }
          }
        }
      \`,
    };

    return client
      .post('/graphql')
      .set('Authorization', \`Bearer \${APPLE_JANE_ADMIN_ACCESS_TOKEN}\`)
      .send(queryData)
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeDefined();
        expect(res.body.errors).toBeUndefined();
      })
      .expect((res) => {
        const data = res.body.data.${queryName};

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const ${queryName} = edges[0].node;

          ${expectSelection}
        }
      });
  });
});
`;
};

const writeTestFile = (
  queryName: string,
  content: string | null,
  force = false,
): string => {
  if (!content) return 'skipped';

  const fileName = `${toKebabCase(queryName)}.integration-spec.ts`;
  const filePath = path.join(TEST_OUTPUT_DIR, fileName);

  if (fs.existsSync(filePath) && !force) {
    return 'skipped';
  }

  fs.writeFileSync(filePath, content);

  return force ? 'updated' : 'created';
};

const generateTests = async (force = false) => {
  fs.mkdirSync(TEST_OUTPUT_DIR, { recursive: true });
  const schemaData = await fetchGraphQLSchema();
  const types = schemaData.data.__schema.types;

  const queryTypeName = schemaData.data.__schema.queryType.name;
  const queryType = types.find((t: any) => t.name === queryTypeName);

  let createdCount = 0;
  let updatedCount = 0;
  let totalCount = 0;

  if (!queryType?.fields) {
    // eslint-disable-next-line no-console
    console.log('No query fields found.');

    return;
  }

  for (const query of queryType.fields) {
    const queryName = query.name;

    if (hasRequiredArgs(query.args)) continue;
    if (queryName.includes('Duplicates')) continue;

    const queryReturnType = unwrapType(query.type);

    if (
      queryReturnType.kind === 'OBJECT' &&
      queryReturnType.name.includes('Connection')
    ) {
      totalCount++;
      const connectionTypeInfo = types.find(
        (f: any) => f.name === queryReturnType.name,
      );
      const edgeTypeInfo = connectionTypeInfo?.fields?.find(
        (f: any) => f.name === 'edges',
      );

      if (edgeTypeInfo) {
        const returnType = unwrapType(edgeTypeInfo.type);
        const returnTypeInfo = types.find(
          (t: any) => t.name === returnType.name,
        );
        const returnNodeTypeInfo = returnTypeInfo?.fields?.find(
          (f: any) => f.name === 'node',
        );

        if (returnNodeTypeInfo) {
          const nodeType = unwrapType(returnNodeTypeInfo.type);
          const nodeTypeInfo = types.find((t: any) => t.name === nodeType.name);

          if (!nodeTypeInfo?.fields) {
            continue;
          }

          const content = generateTestContent(queryName, nodeTypeInfo?.fields);
          const result = writeTestFile(queryName, content, force);

          if (result === 'created') createdCount++;
          if (result === 'updated') updatedCount++;
        }
      }
    }
  }

  // eslint-disable-next-line no-console
  console.log(`Number of tests created: ${createdCount}/${totalCount}`);
  if (force) {
    // eslint-disable-next-line no-console
    console.log(`Number of tests updated: ${updatedCount}/${totalCount}`);
  }
};

// Basic command-line argument parsing
const forceArg = process.argv.includes('--force');

// Call the function with the parsed argument
generateTests(forceArg);
