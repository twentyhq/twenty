import { scrollConversationElementToBottom } from '../utils/conversation-scroll';

describe('conversation-scroll', () => {
  it('uses smooth scrolling and auto when reduced motion is preferred', () => {
    const smoothElement = {
      scrollHeight: 100,
      scrollTo: jest.fn(),
      scrollTop: 0,
    };
    const autoElement = {
      scrollHeight: 100,
      scrollTo: jest.fn(),
      scrollTop: 0,
    };

    scrollConversationElementToBottom({
      element: smoothElement,
      prefersReducedMotion: false,
    });
    scrollConversationElementToBottom({
      element: autoElement,
      prefersReducedMotion: true,
    });

    expect(smoothElement.scrollTo).toHaveBeenCalledWith({
      behavior: 'smooth',
      top: 100,
    });
    expect(autoElement.scrollTo).toHaveBeenCalledWith({
      behavior: 'auto',
      top: 100,
    });
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
