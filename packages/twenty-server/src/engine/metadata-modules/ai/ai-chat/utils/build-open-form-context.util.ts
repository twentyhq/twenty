import {
  type AiChatOpenForm,
  FILL_OPEN_FORM_TOOL_NAME,
} from 'twenty-shared/ai';

export const buildOpenFormContext = (openForm: AiChatOpenForm): string =>
  `<open_form note="The user has this form open. When they describe what it should contain, gather what the form needs with your tools, then fill it with ${FILL_OPEN_FORM_TOOL_NAME}; they review it and save it themselves.">\n${openForm.description}\n</open_form>`;
