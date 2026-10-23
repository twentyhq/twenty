import { spyOn } from 'storybook/test';

import { EMOJI_PICKER_STORY_DATA } from './emojiPickerStoryData';
import { EMOJI_PICKER_STORY_EMOJIBASE_URL } from './emojiPickerStoryEmojibaseUrl';

export const mockEmojiPickerStoryData = ({
  emojibaseUrl = EMOJI_PICKER_STORY_EMOJIBASE_URL,
  emojis = EMOJI_PICKER_STORY_DATA.emojis,
}: {
  emojibaseUrl?: string;
  emojis?: typeof EMOJI_PICKER_STORY_DATA.emojis;
} = {}) => {
  const dataPath = `${emojibaseUrl}/en/data.json`;
  const messagesPath = `${emojibaseUrl}/en/messages.json`;
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
        (requestUrl.pathname === dataPath ||
          requestUrl.pathname === messagesPath);

      if (!isStoryDataRequest) {
        return originalFetch(...parameters);
      }

      const responseBody =
        requestUrl.pathname === dataPath
          ? emojis
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
