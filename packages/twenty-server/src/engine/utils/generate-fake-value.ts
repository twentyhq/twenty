import { faker } from '@faker-js/faker';

export const generateFakeValue = (valueType: string): any => {
  if (valueType === 'string') {
    return faker.lorem.word();
  } else if (valueType === 'number') {
    return faker.number.int();
  } else if (valueType === 'boolean') {
    return faker.datatype.boolean();
  } else if (valueType === 'Date') {
    return faker.date.recent();
  } else if (valueType.endsWith('[]')) {
    const elementType = valueType.replace('[]', '');

    return Array.from({ length: faker.number.int({ min: 2, max: 5 }) }, () =>
      generateFakeValue(elementType),
    );
  } else if (valueType.startsWith('{') && valueType.endsWith('}')) {
    const objData: Record<string, any> = {};

    const properties = valueType
      .slice(1, -1)
      .split(';')
      .map((p) => p.trim())
      .filter((p) => p);

    properties.forEach((property) => {
      const [key, valueType] = property.split(':').map((s) => s.trim());

      objData[key] = generateFakeValue(valueType);
    });

    return objData;
  } else {
    return faker.lorem.word();
  }
};
