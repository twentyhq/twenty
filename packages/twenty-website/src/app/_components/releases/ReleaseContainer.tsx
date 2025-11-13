'use client';
import React, { useEffect, useRef, useState } from 'react';

import { type ReleaseNote } from '@/app/(public)/releases/api/route';
import { getGithubReleaseDateFromReleaseNote } from '@/app/(public)/releases/utils/get-github-release-date-from-release-note';
import { Line } from '@/app/_components/releases/Line';
import { Release } from '@/app/_components/releases/Release';
import { type GithubReleases } from '@/database/model';

interface ReleaseProps {
  visibleReleasesNotes: ReleaseNote[];
  githubReleases: GithubReleases[];
  mdxReleasesContent: any;
}

export const ReleaseContainer = ({
  visibleReleasesNotes,
  githubReleases,
  mdxReleasesContent,
}: ReleaseProps) => {
  const [page, setPage] = useState(1);
  const [releases, setReleases] = useState<ReleaseNote[]>(
    visibleReleasesNotes.slice(0, 5),
  );
  const [loading, setLoading] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (page === 1) return;

    const loadMoreReleases = () => {
      const start = (page - 1) * 5;
      const end = start + 5;
      const newReleases = visibleReleasesNotes.slice(start, end);
      setReleases((prevReleases) => [...prevReleases, ...newReleases]);
    };

    setLoading(true);
    loadMoreReleases();
    setLoading(false);
  }, [page]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          setPage((prevPage) => prevPage + 1);
        }
      },
      {
        threshold: 1.0,
      },
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [loading]);

  return (
    <>
      {releases.map((note, index) => {
        const mdxIndex = visibleReleasesNotes.findIndex(
          (vNote) => vNote.slug === note.slug,
        );
        return (
          <React.Fragment key={note.slug}>
            <Release
              githubPublishedAt={getGithubReleaseDateFromReleaseNote(
                githubReleases,
                note.release,
                note.date,
              )}
              release={note}
              mdxReleaseContent={mdxReleasesContent[mdxIndex]}
            />
            {index != releases.length - 1 && <Line />}
          </React.Fragment>
        );
      })}
      <div ref={loaderRef}>{loading && <p>Loading more releases...</p>}</div>
    </>
  );
};
