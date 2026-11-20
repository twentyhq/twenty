'use client';

import { type RefObject, useEffect, useRef, useState } from 'react';

// PROTOTYPE one-shot viewport reveal: true once the element has entered.
export function useInView<TElement extends Element>(
  threshold = 0.25,
): [RefObject<TElement | null>, boolean] {
  const elementRef = useRef<TElement | null>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (element === null) {
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold]);

  return [elementRef, isInView];
}
