import { BodyType } from 'twenty-shared/workflow';

type BodyTypeWithoutNone = Exclude<BodyType, 'None'>;

export const CONTENT_TYPE_VALUES_HTTP_REQUEST: Record<
  BodyTypeWithoutNone,
  string
> = {
  rawJson: 'application/json',
  FormData: 'multipart/form-data',
  keyValue: 'application/x-www-form-urlencoded',
  Text: 'text/plain',
};
