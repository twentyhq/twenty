import {
  getConversationScrollBehavior,
  scrollConversationElementToBottom,
} from './conversation-scroll';

describe('conversation-scroll', () => {
  it('uses auto scrolling when reduced motion is preferred', () => {
    expect(getConversationScrollBehavior(true)).toBe('auto');
    expect(getConversationScrollBehavior(false)).toBe('smooth');
  });

  it('scrolls to the bottom with native scrollTo when available', () => {
    const element = {
      scrollHeight: 240,
      scrollTo: jest.fn(),
      scrollTop: 0,
    };

    scrollConversationElementToBottom({
      element,
      prefersReducedMotion: false,
    });

    expect(element.scrollTo).toHaveBeenCalledWith({
      behavior: 'smooth',
      top: 240,
    });
    expect(element.scrollTop).toBe(0);
  });

  it('falls back to scrollTop when scrollTo is missing or unsupported', () => {
    const withoutScrollTo = {
      scrollHeight: 320,
      scrollTop: 0,
    };
    const throwingScrollTo = {
      scrollHeight: 480,
      scrollTo: jest.fn(() => {
        throw new Error('unsupported scroll options');
      }),
      scrollTop: 0,
    };

    scrollConversationElementToBottom({
      element: withoutScrollTo,
      prefersReducedMotion: false,
    });
    scrollConversationElementToBottom({
      element: throwingScrollTo,
      prefersReducedMotion: false,
    });

    expect(withoutScrollTo.scrollTop).toBe(320);
    expect(throwingScrollTo.scrollTop).toBe(480);
  });
});
