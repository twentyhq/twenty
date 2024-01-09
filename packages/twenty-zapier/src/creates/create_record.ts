import { Bundle, ZObject } from 'zapier-platform-core';

import { findObjectNamesSingularKey } from '../triggers/find_object_names_singular';
import { capitalize } from '../utils/capitalize';
import { recordInputFields } from '../utils/creates/creates.utils';
import handleQueryParams from '../utils/handleQueryParams';
import requestDb from '../utils/requestDb';

const perform = async (z: ZObject, bundle: Bundle) => {
  const data = bundle.inputData;
  const nameSingular = data.nameSingular;
  delete data.nameSingular;
  const query = `
  mutation create${capitalize(nameSingular)} {
    create${capitalize(nameSingular)}(
      data:{${handleQueryParams(data)}}
    )
    {id}
  }`;
  return await requestDb(z, bundle, query);
};

export const createRecordKey = 'create_record';

export default {
  display: {
    description: 'Create a Record in Twenty.',
    hidden: false,
    label: 'Create Record',
  },
  key: createRecordKey,
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
      recordInputFields,
    ],
    sample: {
      id: '179ed459-79cf-41d9-ab85-96397fa8e936',
    },
    perform,
  },
};
