import { type JSONContent } from 'twenty-emails';

export const parseEmailBody = (body: string): JSONContent | string => {
  try {
    const json = JSON.parse(body);

    return json;
  } catch {
    return body;
  }
};
