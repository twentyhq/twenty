import { Bundle, ZObject } from 'zapier-platform-core';
import requestDb, { requestDbViaRestApi } from '../utils/requestDb';
import handleQueryParams from '../utils/handleQueryParams';

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
    operation: `${operation}.${bundle.inputData.namePlural}`,
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
  return [bundle.cleanedRequest];
};

export const listSample = async (
  z: ZObject,
  bundle: Bundle,
  onlyIds = false,
) => {
  const result: { [key: string]: string }[] = await requestDbViaRestApi(
    z,
    bundle,
    bundle.inputData.namePlural,
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
