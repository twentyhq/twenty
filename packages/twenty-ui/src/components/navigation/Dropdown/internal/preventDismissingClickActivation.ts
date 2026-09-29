const DISMISSING_EVENT_TYPES_FOLLOWED_BY_CLICK = [
  'mousedown',
  'touchend',
  'focusout',
];

const stopActivation = (event: Event) => {
  event.preventDefault();
  event.stopPropagation();
};

export const preventDismissingClickActivation = (event: Event) => {
  if (event.type === 'click') {
    stopActivation(event);
    return;
  }

  if (!DISMISSING_EVENT_TYPES_FOLLOWED_BY_CLICK.includes(event.type)) {
    return;
  }

  const ownerDocument =
    event.target instanceof Node
      ? (event.target.ownerDocument ?? document)
      : document;
  const listenerTarget = ownerDocument.defaultView ?? ownerDocument;
  const followingClickListeners = new AbortController();
  const stopListeningForFollowingClick = () => followingClickListeners.abort();
  const listenerOptions = {
    capture: true,
    signal: followingClickListeners.signal,
  };

  listenerTarget.addEventListener(
    'click',
    (clickEvent) => {
      stopActivation(clickEvent);
      stopListeningForFollowingClick();
    },
    listenerOptions,
  );
  listenerTarget.addEventListener(
    'pointerdown',
    stopListeningForFollowingClick,
    listenerOptions,
  );
  listenerTarget.addEventListener(
    'keydown',
    stopListeningForFollowingClick,
    listenerOptions,
  );
};
