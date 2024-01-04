import { Bundle, ZObject } from 'zapier-platform-core';

import { computeInputFields } from '../../utils/computeInputFields';
import { requestSchema } from '../../utils/requestDb';

export const recordInputFields = async (
  z: ZObject,
  bundle: Bundle,
  idRequired = false,
) => {
  const schema = await requestSchema(z, bundle);
  const infos = schema.components.schemas[bundle.inputData.nameSingular];

  return computeInputFields(infos, idRequired);
};
