import { labelling } from '../utils/labelling';

type Infos = {
  properties: {
    [field: string]: {
      type: string;
      properties?: { [field: string]: { type: string } };
      items?: { [$ref: string]: string };
    };
  };
  example: object;
  required: string[];
};

export const computeInputFields = (infos: Infos): object[] => {
  const result = [];

  for (const fieldName of Object.keys(infos.properties)) {
    switch (infos.properties[fieldName].type) {
      case 'array':
        break;
      case 'object':
        if (!infos.properties[fieldName].properties) {
          break;
        }
        for (const subFieldName of Object.keys(
          infos.properties[fieldName].properties || {},
        )) {
          const field = {
            key: `${fieldName}__${subFieldName}`,
            label: `${labelling(fieldName)}: ${labelling(subFieldName)}`,
            type: infos.properties[fieldName].properties?.[subFieldName].type,
            required: false,
          };
          if (infos.required?.includes(fieldName)) {
            field.required = true;
          }
          result.push(field);
        }
        break;
      default:
        const field = {
          key: fieldName,
          label: labelling(fieldName),
          type: infos.properties[fieldName].type,
          required: false,
        };
        if (infos.required?.includes(fieldName)) {
          field.required = true;
        }
        result.push(field);
    }
  }

  return result;
};
