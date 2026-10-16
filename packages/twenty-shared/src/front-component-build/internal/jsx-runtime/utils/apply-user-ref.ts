import { type UserRef } from '@/front-component-build/internal/jsx-runtime/types/UserRef';

export const applyUserRef = (userRef: UserRef, element: EventTarget | null) => {
  if (typeof userRef === 'function') {
    return userRef(element);
  }

  const isObjectRef = userRef != null && typeof userRef === 'object';
  if (isObjectRef) {
    userRef.current = element;
  }
  return undefined;
};
