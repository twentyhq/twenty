import { Bundle, ZObject } from 'zapier-platform-core';

import { ObjectData } from '../../utils/data.types';
import handleQueryParams from '../../utils/handleQueryParams';
import requestDb, {
  requestDbViaRestApi,
  requestSchema,
} from '../../utils/requestDb';

export enum Operation {
  create = 'create',
  update = 'update',
  delete = 'delete',
}

export const subscribe = async (
  z: ZObject,
  bundle: Bundle,
  operation: Operation,
) => {
  const data = {
    targetUrl: bundle.targetUrl,
    operation: `${operation}.${bundle.inputData.nameSingular}`,
  };
  const result = await requestDb(
    z,
    bundle,
    `mutation createWebhook {createWebhook(data:{${handleQueryParams(
      data,
    )}}) {id}}`,
  );
  return result.data.createWebhook;
};

export const performUnsubscribe = async (z: ZObject, bundle: Bundle) => {
  const data = { id: bundle.subscribeData?.id };
  const result = await requestDb(
    z,
    bundle,
    `mutation deleteWebhook {deleteWebhook(${handleQueryParams(data)}) {id}}`,
  );
  return result.data.deleteWebhook;
};

export const perform = (z: ZObject, bundle: Bundle) => {
  const record = bundle.cleanedRequest.record;
  if (record.createdAt) {
    record.createdAt = record.createdAt + 'Z';
  }
  if (record.updatedAt) {
    record.updatedAt = record.updatedAt + 'Z';
  }
  if (record.revokedAt) {
    record.revokedAt = record.revokedAt + 'Z';
  }
  if (record.expiresAt) {
    record.expiresAt = record.expiresAt + 'Z';
  }
  return [record];
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

export const listSample = async (
  z: ZObject,
  bundle: Bundle,
  onlyIds = false,
): Promise<ObjectData[]> => {
  const nameSingular = bundle.inputData.nameSingular;
  const namePlural = await getNamePluralFromNameSingular(
    z,
    bundle,
    nameSingular,
  );
  const result: { [key: string]: string }[] = await requestDbViaRestApi(
    z,
    bundle,
    namePlural,
  );

  if (onlyIds) {
    return result.map((res) => {
      return {
        id: res.id,
      };
    });
  }

  return result;
};
