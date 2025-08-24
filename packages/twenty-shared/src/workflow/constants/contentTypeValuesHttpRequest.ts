import { BodyType } from 'twenty-shared/workflow';

export const CONTENT_TYPE_VALUES_HTTP_REQUEST: Record<BodyType, string> = {
  rawJson: 'application/json',
  FormData: 'multipart/form-data',
  keyValue: 'application/x-www-form-urlencoded',
  Text: 'text/plain',
  None: '',
};
