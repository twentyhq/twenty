import { useEffect, useRef, useState } from 'react';

export function useHeadsObserver(location: string) {
  const [activeText, setActiveText] = useState('');
  const observer = useRef<IntersectionObserver | null>(null);
  useEffect(() => {
    const handleObsever = (entries: any[]) => {
      entries.forEach((entry) => {
        if (entry?.isIntersecting) {
          setActiveText(entry.target.innerText);
        }
      });
    };

    observer.current = new IntersectionObserver(handleObsever, {
      rootMargin: '0% 0% -85% 0px',
    });

    const elements = document.querySelectorAll('h2, h3, h4, h5');
    elements.forEach((elem) => observer.current?.observe(elem));
    return () => observer.current?.disconnect();
  }, [location]);

  return { activeText };
}
