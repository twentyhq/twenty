import { Bundle, ZObject } from 'zapier-platform-core';
import { requestSchema } from '../utils/requestDb';

const objectNamesPluralListRequest = async (z: ZObject, bundle: Bundle) => {
  const schema = await requestSchema(z, bundle);
  const tags: { name: string }[] = schema.tags;
  return Object.values(tags)
    .filter((tag) => tag.name !== 'General')
    .map((tag) => {
      return { id: tag.name, namePlural: tag.name };
    });
};

export const findObjectNamesPluralKey = 'find_object_names_plural';

export default {
  display: {
    description: 'Find objects',
    label: 'Find objects',
    hidden: true,
  },
  key: findObjectNamesPluralKey,
  noun: 'Object',
  operation: {
    perform: objectNamesPluralListRequest,
  },
};
