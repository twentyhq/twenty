import { makeRestAPIRequest } from 'test/integration/rest/utils/make-rest-api-request.util';

import { pascalCase } from 'src/utils/pascal-case';

export const expectRestCreateInputValidationSuccess = async (
  objectMetadataPluralName: string,
  objectMetadataSingularName: string,
  input: any,
  validateInput: (record: Record<string, any>) => boolean,
) => {
  const response = await makeRestAPIRequest({
    method: 'post',
    path: `/${objectMetadataPluralName}`,
    body: input,
  });

  const records =
    response.body.data[`create${pascalCase(objectMetadataSingularName)}`];

  expect(response.body.error).toBeUndefined();
  expect(validateInput(records)).toBe(true);
};
