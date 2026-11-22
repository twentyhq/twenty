'use client';

import { LocalizedLink } from '@/platform/i18n/LocalizedLink';
import { Code } from './Code';
import { toComponentSlug } from './component-slug';
import { FileList } from './FileList';
import { Hint } from './Hint';
import { InfoCard } from './InfoCard';
import { KindBadge, type ComponentKind } from './KindBadge';
import { SOURCE_URL } from './source-url';

const KIND_HINTS: Record<ComponentKind, string> = {
  component: 'Use it directly in a section.',
  internal: 'Builds other components. Not meant to be used on its own.',
  layout: 'Draws nothing: it only sets spacing.',
  decor: 'A decorative layer, hidden from assistive technology.',
  section: 'A complete section, placed as is.',
};

const nameOf = (file: string) =>
  file.replace(/^ui\//, '').replace(/\.tsx$/, '');

export function IdentityCard({
  name,
  file,
  kind,
  usedBy,
  usedOutsideFiles,
  descriptionSource,
}: {
  name: string;
  file: string;
  kind: ComponentKind;
  usedBy: string[];
  usedOutsideFiles: string[];
  descriptionSource: string;
}) {
  return (
    <InfoCard
      footer={
        <>
          Every row is read from the code by
          scripts/generate-design-system-data.mjs. Files open on GitHub, main
          branch.
        </>
      }
      rows={[
        {
          label: 'Type',
          value: (
            <>
              <KindBadge kind={kind} />
              <Hint>{KIND_HINTS[kind]}</Hint>
            </>
          ),
        },
        {
          label: 'Used in components',
          value: usedBy.length ? (
            <FileList>
              {usedBy.map((user) => (
                <li key={user}>
                  <LocalizedLink
                    href={`/design-system/components/${toComponentSlug(nameOf(user))}`}
                  >
                    {nameOf(user)}
                  </LocalizedLink>
                </li>
              ))}
            </FileList>
          ) : (
            <Hint>None.</Hint>
          ),
        },
        {
          label: 'Used in the site',
          value: usedOutsideFiles.length ? (
            <details>
              <summary>
                {usedOutsideFiles.length === 1
                  ? '1 file'
                  : `${usedOutsideFiles.length} files`}
              </summary>
              <FileList>
                {usedOutsideFiles.map((user) => (
                  <li key={user}>
                    <a href={`${SOURCE_URL}${user}`}>
                      <Code>{user}</Code>
                    </a>
                  </li>
                ))}
              </FileList>
            </details>
          ) : (
            <Hint>Not imported outside src/ui.</Hint>
          ),
        },
        {
          label: 'Import',
          value: <Code>import {`{ ${name} }`} from &apos;@/ui&apos;;</Code>,
        },
        {
          label: 'Source',
          value: (
            <a href={`${SOURCE_URL}${file}`}>
              <Code>src/{file}</Code>
            </a>
          ),
        },
        { label: 'Description', value: <Hint>{descriptionSource}</Hint> },
      ]}
    />
  );
}
