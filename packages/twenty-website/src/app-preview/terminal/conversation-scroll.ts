type ScrollableConversationElement = {
  scrollHeight: number;
  scrollTop: number;
  scrollTo?: (options: ScrollToOptions) => void;
};

export const scrollConversationElementToBottom = ({
  element,
  prefersReducedMotion,
}: {
  element: ScrollableConversationElement;
  prefersReducedMotion: boolean;
}) => {
  const top = element.scrollHeight;

  if (typeof element.scrollTo !== 'function') {
    element.scrollTop = top;
    return;
  }

  // scrollTo with options can throw in older engines and jsdom.
  try {
    element.scrollTo({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      top,
    });
  } catch {
    element.scrollTop = top;
  }
};
