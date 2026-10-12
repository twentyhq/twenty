const DISMISSING_EVENT_TYPES_FOLLOWED_BY_CLICK = [
  'pointerdown',
  'mousedown',
  'touchend',
  'focusout',
];

const EVENT_TYPES_CANCELLING_FOLLOWING_CLICK = ['pointerdown', 'keydown'];

const EVENT_TYPES_CANCELLING_FOLLOWING_CLICK_AFTER_FOCUS_OUT = [
  ...EVENT_TYPES_CANCELLING_FOLLOWING_CLICK,
  'keyup',
  'mousedown',
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
  const eventTypesCancellingFollowingClick =
    event.type === 'focusout'
      ? EVENT_TYPES_CANCELLING_FOLLOWING_CLICK_AFTER_FOCUS_OUT
      : EVENT_TYPES_CANCELLING_FOLLOWING_CLICK;

  listenerTarget.addEventListener(
    'click',
    (clickEvent) => {
      stopActivation(clickEvent);
      stopListeningForFollowingClick();
    },
    listenerOptions,
  );

  for (const eventType of eventTypesCancellingFollowingClick) {
    listenerTarget.addEventListener(
      eventType,
      stopListeningForFollowingClick,
      listenerOptions,
    );
  }
};
