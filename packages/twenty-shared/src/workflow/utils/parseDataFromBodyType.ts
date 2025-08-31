import { BodyType } from '@/workflow/types/workflowHttpRequestStep';

type InputData = Record<string, any> | string;

const parseUrlEncoded = (data: InputData): string => {
  let parsed: InputData;
  if (typeof data === 'string') {
    try {
      parsed = JSON.parse(data);
    } catch {
      parsed = data;
    }
  } else {
    parsed = data;
  }
  return new URLSearchParams(parsed).toString();
};

const parseFormData = (data: InputData): FormData => {
  const form = new FormData();
  if (typeof data === 'string') {
    try {
      const obj = JSON.parse(data);

      Object.entries(obj).forEach(([key, val]) =>
        form.append(key, String(val)),
      );
    } catch {
      throw new Error('String data for FormData must be valid JSON');
    }
  } else {
    Object.entries(data).forEach(([key, val]) => form.append(key, val));
  }
  return form;
};

const parseJson = (data: InputData): string => {
  if (typeof data === 'string') return data;
  return JSON.stringify(data);
};

const parseText = (data: InputData): string => {
  if (typeof data === 'string') return data;

  return Object.entries(data)
    .map(([key, val]) => `${key}=${val}`)
    .join('\n');
};

export const parseDataFromBodyType = (
  bodyType: BodyType | undefined,
  data: InputData,
) => {
  if (bodyType === undefined) return parseJson(data);
  switch (bodyType) {
    case 'keyValue':
      return parseUrlEncoded(data);
    case 'FormData':
      return parseFormData(data);
    case 'rawJson':
      return parseJson(data);
    case 'Text':
      return parseText(data);
    default:
      return parseJson(data);
  }
};
