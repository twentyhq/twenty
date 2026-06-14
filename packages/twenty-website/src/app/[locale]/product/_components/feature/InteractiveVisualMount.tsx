'use client';

import { useEffect, useRef, useState, type ComponentType } from 'react';

type InteractiveVisualMountProps = {
  visual: ComponentType<{ active: boolean }>;
};

export function InteractiveVisualMount({
  visual: Visual,
}: InteractiveVisualMountProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        setActive(entries[0].isIntersecting);
      },
      { threshold: 0.3 },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ height: '100%', width: '100%' }}>
      <Visual active={active} />
    </div>
  );
}
