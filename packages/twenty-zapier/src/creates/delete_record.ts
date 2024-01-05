import { Bundle, ZObject } from 'zapier-platform-core';

import { findObjectNamesSingularKey } from '../triggers/find_object_names_singular';
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
        key: 'nameSingular',
        required: true,
        label: 'Record Name',
        dynamic: `${findObjectNamesSingularKey}.nameSingular`,
        altersDynamicFields: true,
      },
      { key: 'id', label: 'Id', type: 'string', required: true },
    ],
    sample: {
      id: '179ed459-79cf-41d9-ab85-96397fa8e936',
    },
    perform,
  },
};
