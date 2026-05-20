type ScrollableConversationElement = {
  scrollHeight: number;
  scrollTop: number;
  scrollTo?: (options: ScrollToOptions) => void;
};

const getConversationScrollBehavior = (
  prefersReducedMotion: boolean,
): ScrollBehavior => (prefersReducedMotion ? 'auto' : 'smooth');

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

  try {
    element.scrollTo({
      behavior: getConversationScrollBehavior(prefersReducedMotion),
      top,
    });
  } catch {
    element.scrollTop = top;
  }
};
