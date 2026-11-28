'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

// A FilterBar's selection, kept in the URL (?regions=EUROPE,LATAM): one
// comma-joined, sorted param per facet, as the partners directory already
// wrote it, so a filtered list is shareable and Back undoes a filter. Only
// values a facet allows are read, so a stale link can't inject one.

type FacetValues = Record<string, readonly string[]>;

type Selection<Allowed extends FacetValues> = {
  [Key in keyof Allowed]: ReadonlySet<Allowed[Key][number]>;
};

type UrlFilters<Allowed extends FacetValues> = {
  clearAll: () => void;
  hasAny: boolean;
  selected: Selection<Allowed>;
  toggle: (facetKey: string, value: string) => void;
};

// Pass a module constant: its identity keys the parsing.
export const useUrlFilters = <Allowed extends FacetValues>(
  allowed: Allowed,
): UrlFilters<Allowed> => {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const selected = useMemo(() => {
    const result: Record<string, ReadonlySet<string>> = {};
    for (const [key, values] of Object.entries(allowed)) {
      const raw = params.get(key);
      result[key] = new Set(
        raw === null
          ? []
          : raw
              .split(',')
              .map((value) => value.trim())
              .filter((value) => values.includes(value)),
      );
    }
    return result as Selection<Allowed>;
  }, [allowed, params]);

  const write = useCallback(
    (next: Record<string, ReadonlySet<string>>) => {
      const query = new URLSearchParams(params.toString());
      for (const key of Object.keys(allowed)) {
        const values = next[key] ?? new Set<string>();
        if (values.size === 0) {
          query.delete(key);
        } else {
          query.set(key, [...values].toSorted().join(','));
        }
      }
      const text = query.toString();
      router.replace(text ? `${pathname}?${text}` : pathname, {
        scroll: false,
      });
    },
    [allowed, params, pathname, router],
  );

  const toggle = useCallback(
    (facetKey: string, value: string) => {
      const current = new Set<string>(
        (selected as Record<string, ReadonlySet<string>>)[facetKey] ?? [],
      );
      if (current.has(value)) {
        current.delete(value);
      } else {
        current.add(value);
      }
      write({ ...selected, [facetKey]: current });
    },
    [selected, write],
  );

  const clearAll = useCallback(() => write({}), [write]);

  return {
    clearAll,
    hasAny: Object.values(selected).some((values) => values.size > 0),
    selected,
    toggle,
  };
};
