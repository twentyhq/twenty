import { Bundle, ZObject } from "zapier-platform-core";
import requestDb, { requestSchema } from "../utils/requestDb";
import handleQueryParams from "../utils/handleQueryParams";
import { capitalize } from "../utils/capitalize";
import { computeInputFields } from "../utils/computeInputFields";

const objectInputFields = async (z: ZObject, bundle: Bundle) => {
  const schema = await requestSchema(z, bundle)
  const infos = schema.components.schemas[bundle.inputData.nameSingular]

  return computeInputFields(infos);
}

const perform = async (z: ZObject, bundle: Bundle) => {
  const data = bundle.inputData
  const nameSingular = data.nameSingular
  delete data.nameSingular
  const query = `
  mutation create${capitalize(nameSingular)} {
    create${capitalize(nameSingular)}(
      data:{${handleQueryParams(data)}}
    )
    {id}
  }`;
  return await requestDb(z, bundle, query);
};

export default {
  display: {
    description: 'Creates a new Object in Twenty',
    hidden: false,
    label: 'Create New Object',
  },
  key: 'create_object',
  noun: 'Object',
  operation: {
    inputFields: [
      {
        key: 'nameSingular',
        required: true,
        label: 'Singular Name of the Object to create',
        dynamic: 'find_objects.nameSingular.nameSingular',
        altersDynamicFields: true,
      },
      objectInputFields
    ],
    sample: {
      id: '179ed459-79cf-41d9-ab85-96397fa8e936',
    },
    perform
  },
}
