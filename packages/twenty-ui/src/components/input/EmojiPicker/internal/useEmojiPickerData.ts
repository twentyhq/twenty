import { defaultEmojiDataResolver, type EmojiData } from 'frimousse';
import { useEffect, useState } from 'react';

export const useEmojiPickerData = ({
  emojibaseUrl,
  locale,
}: {
  emojibaseUrl: string;
  locale: string;
}) => {
  const [emojiData, setEmojiData] = useState<EmojiData>();

  useEffect(() => {
    const abortController = new AbortController();

    Promise.resolve(
      defaultEmojiDataResolver(locale, {
        emojibaseUrl,
        signal: abortController.signal,
      }),
    )
      .then((data) => {
        if (!abortController.signal.aborted) {
          setEmojiData(data);
        }
      })
      .catch(() => undefined);

    return () => abortController.abort();
  }, [emojibaseUrl, locale]);

  return emojiData;
};
