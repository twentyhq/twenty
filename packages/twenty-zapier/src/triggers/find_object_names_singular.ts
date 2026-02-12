import type { Bundle, ZObject } from 'zapier-platform-core';

import { requestSchema } from '../utils/requestDb';

const objectListRequest = async (z: ZObject, bundle: Bundle) => {
  const schema = await requestSchema(z, bundle);
  return schema.data.objects.edges.map((edge: any) => {
    const object = edge.node;
    return {
      id: object.nameSingular,
      nameSingular: object.nameSingular,
      labelSingular: object.labelSingular,
    };
  });
};

export const findObjectNamesSingularKey = 'find_object_names_singular';

export default {
  display: {
    description: 'Find objects',
    label: 'Find objects',
    hidden: true,
  },
  key: findObjectNamesSingularKey,
  noun: 'Object',
  operation: {
    perform: objectListRequest,
  },
};
