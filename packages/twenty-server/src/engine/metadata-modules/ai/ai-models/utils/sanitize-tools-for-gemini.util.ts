type PlainObject = Record<string, unknown>;

// Recursively resolves $ref and removes $defs from a JSON Schema.
// Handles recursive schemas by breaking cycles with { type: "object" }.
const inlineRefs = (
  node: unknown,
  defs: PlainObject,
  resolving: Set<string>,
): unknown => {
  if (node === null || typeof node !== 'object') return node;

  if (Array.isArray(node)) {
    return node.map((item) => inlineRefs(item, defs, resolving));
  }

  const obj = node as PlainObject;

  if (typeof obj.$ref === 'string') {
    const name = obj.$ref.replace(/^#\/\$defs\//, '');

    if (resolving.has(name)) {
      return { type: 'object' };
    }

    const resolved = defs[name];

    if (resolved === undefined) return obj;

    const nextResolving = new Set(resolving);

    nextResolving.add(name);

    return inlineRefs(resolved, defs, nextResolving);
  }

  const localDefs: PlainObject = {
    ...defs,
    ...((obj.$defs as PlainObject) ?? {}),
  };

  const result: PlainObject = {};

  for (const [key, value] of Object.entries(obj)) {
    if (key === '$defs') continue;
    result[key] = inlineRefs(value, localDefs, resolving);
  }

  return result;
};

// Removes $defs/$ref from a JSON Schema, inlining definitions.
// Recursive references are truncated to { type: "object" }.
export const sanitizeJsonSchemaForGemini = (
  schema: PlainObject,
): PlainObject => {
  const defs = (schema.$defs as PlainObject) ?? {};

  return inlineRefs(schema, defs, new Set()) as PlainObject;
};

