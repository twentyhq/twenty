'use client';

import { styled } from '@linaria/react';
import { useState } from 'react';

import {
  fontFamily,
  fontSize,
  radius,
  semanticColor,
  spacing,
  type Scheme,
} from '@/tokens';
import { Body, Heading } from '@/ui';

import { Breadcrumb } from './Breadcrumb';
import { axisValues, combinations, type DocProp } from './component-axes';
import { Code } from './Code';
import COMPONENT_DOCS from './component-docs.json';
import { type ComponentContent } from './component-content';
import { COMPONENT_REGISTRY } from './component-registry';
import { toComponentSlug } from './component-slug';
import { AccessibilitySection } from './AccessibilitySection';
import { DocPage } from './DocPage';
import { DocSectionRoot } from './DocSectionRoot';
import { Example } from './Example';
import { IdentityCard } from './IdentityCard';
import { ProblemCount } from './ProblemCount';
import { SOURCE_URL } from './source-url';
import { type ComponentKind } from './KindBadge';
import { MotionSection } from './MotionSection';
import { CodeSection } from './CodeSection';
import { PreviewPanel, type XrayPart } from './PreviewPanel';
import { RelatedSection } from './RelatedSection';
import { ResponsiveSection } from './ResponsiveSection';
import { Table } from './Table';
import { TableScroll } from './TableScroll';


const MAX_COMBINATIONS = 12;

const GROUP_OF_KIND: Record<ComponentKind, string> = {
  component: 'Elements',
  section: 'Sections',
  layout: 'Layout',
  internal: 'Building blocks',
  decor: 'Building blocks',
};

const Intro = styled.header`
  max-width: ${spacing(180)};
  padding-bottom: ${spacing(6)};

  & > * + * {
    margin-top: ${spacing(3)};
  }
`;

// Under the summary, like Arc's install line: what to copy on the left,
// where to go on the right.
const ActionRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing(3)};
  justify-content: space-between;
  padding-bottom: ${spacing(10)};
`;

const ImportChip = styled.button`
  align-items: center;
  background: none;
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  color: ${semanticColor.ink};
  cursor: pointer;
  display: flex;
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  gap: ${spacing(3)};
  height: ${spacing(10)};
  padding-inline: ${spacing(3)};

  & span {
    color: ${semanticColor.inkSubtle};
  }

  &:hover {
    border-color: ${semanticColor.lineStrong};
  }
`;

const Actions = styled.div`
  display: flex;
  gap: ${spacing(2)};

  & a {
    align-items: center;
    border: 1px solid ${semanticColor.line};
    border-radius: ${radius(2)};
    color: ${semanticColor.ink};
    display: flex;
    font-family: ${fontFamily('sans')};
    font-size: ${fontSize(3.5)};
    gap: ${spacing(2)};
    height: ${spacing(10)};
    padding-inline: ${spacing(3)};
    text-decoration: none;
  }

  & a:hover {
    border-color: ${semanticColor.lineStrong};
  }
`;

const ExampleGroup = styled.div`
  padding-top: ${spacing(12)};
  scroll-margin-top: ${spacing(28)};
`;

const Cell = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;

  &[data-layout='stack'] {
    width: 100%;
  }

  & > * + * {
    margin-top: ${spacing(2)};
  }
`;

// The Code tab of the preview: what to paste, not the component's source.
const UsageCode = styled.pre`
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  color: ${semanticColor.ink};
  font-family: ${fontFamily('mono')};
  font-size: ${fontSize(3)};
  overflow-x: auto;
  padding: ${spacing(6)};
`;

// Splits the page: above for whoever uses the component, below for whoever
// maintains it.
const UnderTheHood = styled.div`
  border-top: 1px solid ${semanticColor.line};
  margin-top: ${spacing(16)};
  padding-top: ${spacing(4)};
`;

const PracticeList = styled.ul`
  padding-left: ${spacing(5)};

  & > * + * {
    margin-top: ${spacing(3)};
  }
`;

const attribute = (name: string, value: unknown) =>
  value === true ? name : `${name}="${String(value)}"`;

// "size" → "Sizes", "disabled" → "Disabled": a section per prop, named
// like the other design systems name theirs.
const axisTitle = (prop: DocProp) => {
  const name = prop.name.charAt(0).toUpperCase() + prop.name.slice(1);
  return prop.values ? `${name}s` : name;
};

export function ComponentPage({ slug }: { slug: string }) {
  const [scheme, setScheme] = useState<Scheme>('dark');
  const [copied, setCopied] = useState(false);
  const [flashPart, setFlashPart] = useState<string | null>(null);
  const [previewTab, setPreviewTab] = useState<'preview' | 'code'>('preview');
  const doc = COMPONENT_DOCS.components.find(
    (component) => toComponentSlug(component.name) === slug,
  );
  if (!doc) return null;
  // A component with no content file still gets its generated page.
  const content: ComponentContent = COMPONENT_REGISTRY.find(
    (entry) => entry.name === doc.name,
  ) ?? { name: doc.name, summary: null };
  // The code's own comment wins; otherwise the summary written for this page.
  const summary = doc.description ?? content.summary;
  const summarySource = doc.description
    ? 'Taken from the comment above the component.'
    : content.summary
      ? 'Written for this page after reading the code: the component has no comment yet.'
      : 'None: the component has no comment and no content file.';
  const props = doc?.props ?? [];
  const axes = content.renderWith
    ? props.filter(
        (prop) =>
          axisValues(prop).length > 1 &&
          !(content.hiddenAxes ?? []).includes(prop.name),
      )
    : [];
  const enumAxes = axes.filter((prop) => prop.values !== null);
  const grid = enumAxes.length > 1 ? combinations(enumAxes) : [];
  const shownScheme = content.fixedScheme ?? scheme;
  const layout = content.layout ?? 'row';

  const showsGrid =
    !content.hideCombinations &&
    grid.length > 1 &&
    grid.length <= MAX_COMBINATIONS;
  const hasExamples =
    axes.length > 0 || showsGrid || (content.examples ?? []).length > 0;
  const toc = [
    { id: 'preview', label: 'Preview' },
    ...(showsGrid ? [{ id: 'combinations', label: 'Overview' }] : []),
    ...(hasExamples ? [{ id: 'examples', label: 'Examples' }] : []),
    ...(content.practices?.length
      ? [{ id: 'best-practices', label: 'Usage guidelines' }]
      : []),
    { id: 'accessibility', label: 'Accessibility' },
    { id: 'props', label: 'API reference' },
    { id: 'related', label: 'Related' },
    { id: 'under-the-hood', label: 'Under the hood' },
  ];
  const importLine = `import { ${doc.name} } from '@/ui';`;
  const copyImport = () => {
    navigator.clipboard.writeText(importLine).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      },
      () => setCopied(false),
    );
  };
  const inspectHref = `/design-system/inspect/components/${slug}`;

  const toJsx = (axisProps: Record<string, unknown>) => {
    const attributes = [
      ...Object.entries(content.baseCode ?? {}).map(
        ([name, value]) => `${name}=${value}`,
      ),
      ...Object.entries(axisProps)
        .filter(([, value]) => value !== false && value !== undefined)
        .map(([name, value]) => attribute(name, value)),
    ];
    const opening = `<${content.name}${attributes.length ? ` ${attributes.join(' ')}` : ''}`;
    return content.codeChildren
      ? `${opening}>${content.codeChildren}</${content.name}>`
      : `${opening} />`;
  };

  // The preview shows the component with its default props, or the first
  // written example when the page has no axis renderer.
  const firstExample = content.examples?.[0];
  const mainRender = content.renderWith
    ? content.renderWith({})
    : (firstExample?.render() ?? null);
  const SEVERITY_RANK = { error: 0, warning: 1, info: 2 } as const;
  const xrayParts: XrayPart[] = doc.code.parts.flatMap((part) => {
    const hand = part.declarations.filter(
      (declaration) => declaration.kind === 'hand',
    );
    if (hand.length === 0) return [];
    const worst = hand
      .filter(
        (declaration) =>
          declaration.severity === 'error' ||
          declaration.severity === 'warning',
      )
      .toSorted(
        (first, second) =>
          SEVERITY_RANK[first.severity as 'error' | 'warning'] -
          SEVERITY_RANK[second.severity as 'error' | 'warning'],
      )[0];
    return [
      worst
        ? {
            part: part.part,
            severity: worst.severity as 'error' | 'warning',
            summary: `${worst.property} ${worst.value.replace(/\$\{[^}]*\}/g, '').trim()} · line ${worst.line}`,
          }
        : {
            part: part.part,
            severity: 'info' as const,
            summary: `${hand.length} by hand, no token`,
          },
    ];
  });
  // The preview's Code tab now shows usage, so a cited line opens on GitHub.
  const openLine = (line: number) => {
    window.open(`${SOURCE_URL}${doc.file}#L${line}`, '_blank', 'noopener');
  };
  const usageCode = `${importLine}\n\n${content.renderWith ? toJsx({}) : (firstExample?.code ?? '')}`;
  const flash = (part: string) => {
    setPreviewTab('preview');
    setFlashPart(part);
    document
      .getElementById('preview')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => setFlashPart(null), 1800);
  };

  return (
    <DocPage toc={toc}>
      <Intro>
        <Breadcrumb
          items={[
            { label: 'Design system', href: '/design-system' },
            { label: 'Components' },
            { label: GROUP_OF_KIND[doc.kind as ComponentKind] },
          ]}
        />
        <Heading as="h1" size="lg">
          {content.name}
        </Heading>
        {summary ? <Body muted>{summary}</Body> : null}
      </Intro>
      <ActionRow>
        <ImportChip type="button" onClick={copyImport}>
          {importLine}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </ImportChip>
        <Actions>
          <a href={`${SOURCE_URL}${doc.file}`}>Source ↗</a>
        </Actions>
      </ActionRow>

      <PreviewPanel
        codeView={
          <UsageCode>
            <code>{usageCode}</code>
          </UsageCode>
        }
        tab={previewTab}
        onTabChange={setPreviewTab}
        fixedScheme={Boolean(content.fixedScheme)}
        inspectHref={inspectHref}
        flashPart={flashPart}
        scheme={shownScheme}
        xrayParts={xrayParts}
        onSchemeChange={setScheme}
      >
        {mainRender}
      </PreviewPanel>

      {hasExamples ? (
        <ExampleGroup id="examples">
          <Heading as="h2" family="sans" size="sm">
            Examples
          </Heading>
          {showsGrid ? (
            <Example
              code={grid.map(toJsx).join('\n')}
              description={
                <>
                  Every {enumAxes.map((prop) => prop.name).join(' and ')} side
                  by side.
                </>
              }
              id="combinations"
              scheme={shownScheme}
              title="Overview"
            >
              {grid.map((row) => (
                <Cell key={Object.values(row).join('-')} data-layout={layout}>
                  {content.renderWith?.(row)}
                  <Code>{Object.values(row).map(String).join(' · ')}</Code>
                </Cell>
              ))}
            </Example>
          ) : null}

          {axes.map((prop) => (
            <Example
              key={prop.name}
              code={axisValues(prop)
                .map((value) => toJsx({ [prop.name]: value }))
                .join('\n')}
              description={
                prop.default === null ? undefined : (
                  <>
                    Default: <Code>{prop.default}</Code>
                  </>
                )
              }
              id={prop.name}
              scheme={shownScheme}
              title={axisTitle(prop)}
            >
              {axisValues(prop).map((value) => (
                <Cell key={String(value)} data-layout={layout}>
                  {content.renderWith?.({ [prop.name]: value })}
                  <Code>{String(value)}</Code>
                </Cell>
              ))}
            </Example>
          ))}

          {(content.examples ?? []).map((example) => (
            <Example
              key={example.id}
              code={example.code}
              description={example.description}
              id={example.id}
              scheme={example.scheme ?? shownScheme}
              title={example.title}
            >
              {example.render()}
            </Example>
          ))}
        </ExampleGroup>
      ) : null}

      {content.practices?.length ? (
        <DocSectionRoot id="best-practices">
          <Heading as="h2" family="sans" size="sm">
            Usage guidelines
          </Heading>
          <PracticeList>
            {content.practices.map((practice) => (
              <li key={practice.id}>
                <Body size="sm">{practice.text}</Body>
              </li>
            ))}
          </PracticeList>
        </DocSectionRoot>
      ) : null}

      <AccessibilitySection behavior={doc.behavior} />

      <DocSectionRoot id="props">
        <Heading as="h2" family="sans" size="sm">
          API reference
        </Heading>
        {props.length === 0 ? (
          <Body size="sm">None.</Body>
        ) : (
          <TableScroll>
            <Table>
              <thead>
                <tr>
                  <th>Prop</th>
                  <th>Type</th>
                  <th>Default</th>
                  <th>Required</th>
                </tr>
              </thead>
              <tbody>
                {props.map((prop) => (
                  <tr key={prop.name}>
                    <td>
                      <Code>{prop.name}</Code>
                    </td>
                    <td>
                      <Code>
                        {prop.values
                          ? prop.values.map((value) => `'${value}'`).join(' | ')
                          : prop.type}
                      </Code>
                    </td>
                    <td>
                      {prop.default === null ? '' : <Code>{prop.default}</Code>}
                    </td>
                    <td>{prop.required ? 'Yes' : ''}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableScroll>
        )}
        <Body muted size="sm">
          Read from the component&apos;s types by
          scripts/generate-design-system-data.mjs.
        </Body>
      </DocSectionRoot>

      <RelatedSection behavior={doc.behavior} usedBy={doc.usage.usedBy} />

      <UnderTheHood id="under-the-hood">
        <DocSectionRoot>
          <Heading as="h2" family="sans" size="sm">
            Under the hood
          </Heading>
          <Body muted size="sm">
            For whoever maintains {content.name}: where its values come from,
            where it is used, how it moves and reflows.{' '}
            <ProblemCount problems={doc.problems} />
          </Body>
        </DocSectionRoot>
        <CodeSection
          code={doc.code}
          file={doc.file}
          onFlash={flash}
          onOpenLine={openLine}
        />
        <DocSectionRoot id="usage">
          <Heading as="h2" family="sans" size="sm">
            Where it is used
          </Heading>
          <IdentityCard
            descriptionSource={summarySource}
            file={doc.file}
            kind={doc.kind as ComponentKind}
            name={doc.name}
            usedBy={doc.usage.usedBy}
            usedOutsideFiles={doc.usage.usedOutsideFiles}
          />
        </DocSectionRoot>
        <MotionSection behavior={doc.behavior} />
        <ResponsiveSection behavior={doc.behavior} />
      </UnderTheHood>
    </DocPage>
  );
}
