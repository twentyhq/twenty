import type { BodyType } from '../types/workflowHttpRequestStep';

export const CONTENT_TYPE_VALUES_HTTP_REQUEST: Record<BodyType, string> = {
  rawJson: 'application/json',
  formData: 'multipart/form-data',
  keyValue: 'application/x-www-form-urlencoded',
  text: 'text/plain',
  none: '',
};
