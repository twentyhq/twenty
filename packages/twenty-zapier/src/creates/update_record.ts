import { Bundle, ZObject } from 'zapier-platform-core';

import { findObjectNamesSingularKey } from '../triggers/find_object_names_singular';
import { capitalize } from '../utils/capitalize';
import { recordInputFields } from '../utils/creates/creates.utils';
import handleQueryParams from '../utils/handleQueryParams';
import requestDb from '../utils/requestDb';

export const updateRecordKey = 'update_record';

const perform = async (z: ZObject, bundle: Bundle) => {
  const data = bundle.inputData;
  const nameSingular = data.nameSingular;
  const id = data.id;
  delete data.nameSingular;
  delete data.id;
  const query = `
  mutation update${capitalize(nameSingular)} {
    update${capitalize(nameSingular)}(
      data:{${handleQueryParams(data)}},
      id: "${id}"
    )
    {id}
  }`;
  return await requestDb(z, bundle, query);
};

const updateRecordInputFields = async (z: ZObject, bundle: Bundle) => {
  return recordInputFields(z, bundle, true);
};

export default {
  display: {
    description: 'Update a Record in Twenty.',
    hidden: false,
    label: 'Update Record',
  },
  key: updateRecordKey,
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
      updateRecordInputFields,
    ],
    sample: {
      id: '179ed459-79cf-41d9-ab85-96397fa8e936',
    },
    perform,
  },
};
