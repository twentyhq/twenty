import { Bundle, ZObject } from 'zapier-platform-core';
import requestDb, { requestSchema } from '../utils/requestDb';
import handleQueryParams from '../utils/handleQueryParams';
import { capitalize } from '../utils/capitalize';
import { computeInputFields } from '../utils/computeInputFields';
import { findObjectNamesSingularKey } from '../triggers/find_object_names_singular';

const recordInputFields = async (z: ZObject, bundle: Bundle) => {
  const schema = await requestSchema(z, bundle);
  const infos = schema.components.schemas[bundle.inputData.nameSingular];

  return computeInputFields(infos);
};

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
    description: 'Creates a new Record in Twenty',
    hidden: false,
    label: 'Create New Record',
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
