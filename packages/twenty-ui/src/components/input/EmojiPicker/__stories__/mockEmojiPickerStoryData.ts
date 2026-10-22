import { spyOn } from 'storybook/test';

import { EMOJI_PICKER_STORY_DATA } from './emojiPickerStoryData';
import { EMOJI_PICKER_STORY_EMOJIBASE_URL } from './emojiPickerStoryEmojibaseUrl';

const EMOJI_PICKER_STORY_DATA_PATH = `${EMOJI_PICKER_STORY_EMOJIBASE_URL}/en/data.json`;
const EMOJI_PICKER_STORY_MESSAGES_PATH = `${EMOJI_PICKER_STORY_EMOJIBASE_URL}/en/messages.json`;

export const mockEmojiPickerStoryData = () => {
  const originalFetch = globalThis.fetch;
  const mockedFetch = spyOn(globalThis, 'fetch').mockImplementation(
    (...parameters: Parameters<typeof fetch>) => {
      const [request] = parameters;
      const requestUrl = new URL(
        request instanceof Request ? request.url : request,
        window.location.origin,
      );
      const isStoryDataRequest =
        requestUrl.origin === window.location.origin &&
        (requestUrl.pathname === EMOJI_PICKER_STORY_DATA_PATH ||
          requestUrl.pathname === EMOJI_PICKER_STORY_MESSAGES_PATH);

      if (!isStoryDataRequest) {
        return originalFetch(...parameters);
      }

      const responseBody =
        requestUrl.pathname === EMOJI_PICKER_STORY_DATA_PATH
          ? EMOJI_PICKER_STORY_DATA.emojis
          : EMOJI_PICKER_STORY_DATA.messages;

      return Promise.resolve(
        Response.json(responseBody, {
          headers: { ETag: '"emoji-picker-story"' },
        }),
      );
    },
  );

  return () => mockedFetch.mockRestore();
};
