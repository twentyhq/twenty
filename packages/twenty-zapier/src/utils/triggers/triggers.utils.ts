import { type Bundle, type ZObject } from 'zapier-platform-core';

import handleQueryParams from '../../utils/handleQueryParams';
import requestDb, {
  requestDbViaRestApi,
  requestSchema,
} from '../../utils/requestDb';

export enum DatabaseEventAction {
  CREATED = 'created',
  UPDATED = 'updated',
  DELETED = 'deleted',
}

export const performSubscribe = async (z: ZObject, bundle: Bundle) => {
  const data = {
    targetUrl: bundle.targetUrl,
    operations: [
      `${bundle.inputData.nameSingular}.${bundle.inputData.operation}`,
    ],
    secret: '',
  };
  const result = await requestDb(
    z,
    bundle,
    `mutation createWebhook {createWebhook(input:{${handleQueryParams(
      data,
    )}}) {id}}`,
    'metadata',
  );
  return result.data.createWebhook;
};

export const performUnsubscribe = async (
  z: ZObject,
  bundle: Bundle,
): Promise<boolean> => {
  const data = { id: bundle.subscribeData?.id };
  const result = await requestDb(
    z,
    bundle,
    `mutation deleteWebhook {deleteWebhook(input: {${handleQueryParams(data)}})}`,
    'metadata',
  );
  return result.data.deleteWebhook;
};

export const perform = (z: ZObject, bundle: Bundle) => {
  const data = {
    record: bundle.cleanedRequest.record,
    ...(bundle.cleanedRequest.updatedFields && {
      updatedFields: bundle.cleanedRequest.updatedFields,
    }),
  };
  if (data.record.createdAt) {
    data.record.createdAt = data.record.createdAt + 'Z';
  }
  if (data.record.updatedAt) {
    data.record.updatedAt = data.record.updatedAt + 'Z';
  }
  if (data.record.revokedAt) {
    data.record.revokedAt = data.record.revokedAt + 'Z';
  }
  if (data.record.expiresAt) {
    data.record.expiresAt = data.record.expiresAt + 'Z';
  }

  return [data];
};

const getNamePluralFromNameSingular = async (
  z: ZObject,
  bundle: Bundle,
  nameSingular: string,
): Promise<string> => {
  const result = await requestSchema(z, bundle);
  for (const object of result.data.objects.edges) {
    if (object.node.nameSingular === nameSingular) {
      return object.node.namePlural;
    }
  }
  throw new Error(`Unknown Object Name Singular ${nameSingular}`);
};

export const performList = async (
  z: ZObject,
  bundle: Bundle,
): Promise<{ record: Record<string, any>; updatedFields?: string[] }[]> => {
  const nameSingular = bundle.inputData.nameSingular;
  const namePlural = await getNamePluralFromNameSingular(
    z,
    bundle,
    nameSingular,
  );
  const results = await requestDbViaRestApi(z, bundle, namePlural);
  return results.map((result) => ({
    record: result,
    ...(bundle.inputData.operation === DatabaseEventAction.UPDATED && {
      updatedFields: [Object.keys(result).filter((key) => key !== 'id')?.[0]],
    }),
  }));
};
