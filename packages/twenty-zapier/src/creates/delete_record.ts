import { Bundle, ZObject } from 'zapier-platform-core';

import { findObjectNamesPluralKey } from '../triggers/find_object_names_plural';
import { listRecordIdsKey } from '../triggers/list_record_ids';
import { capitalize } from '../utils/capitalize';
import requestDb from '../utils/requestDb';

export const deleteRecordKey = 'delete_record';

const perform = async (z: ZObject, bundle: Bundle) => {
  const data = bundle.inputData;
  const nameSingular = data.nameSingular;
  const id = data.id;
  delete data.nameSingular;
  delete data.id;
  const query = `
  mutation delete${capitalize(nameSingular)} {
    delete${capitalize(nameSingular)}(
      id: "${id}"
    )
    {id}
  }`;
  return await requestDb(z, bundle, query);
};

export default {
  display: {
    description: 'Delete a Record in Twenty.',
    hidden: false,
    label: 'Delete Record',
  },
  key: deleteRecordKey,
  noun: 'Record',
  operation: {
    inputFields: [
      {
        key: 'namePlural',
        label: 'Record Name',
        dynamic: `${findObjectNamesPluralKey}.namePlural`,
        required: true,
        altersDynamicFields: true,
      },
      {
        key: 'id',
        label: 'Id',
        type: 'string',
        dynamic: `${listRecordIdsKey}.id`,
        required: true,
      },
    ],
    sample: {
      id: '179ed459-79cf-41d9-ab85-96397fa8e936',
    },
    perform,
  },
};
