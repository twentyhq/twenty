import { useRender } from '@base-ui/react/use-render';
import { clsx } from 'clsx';

import { type CodeEditorHeaderProps } from './types/CodeEditorHeaderProps';

import styles from './CodeEditorHeader.module.scss';

export const CodeEditorHeader = ({
  title,
  startElement,
  endElement,
  className,
  render,
  ref,
  ...props
}: CodeEditorHeaderProps) =>
  useRender({
    render,
    ref,
    props: {
      ...props,
      className: clsx(styles.editorHeader, className),
      children: (
        <>
          <div className={styles.elementContainer}>
            {startElement}
            {title}
          </div>
          <div className={styles.elementContainer}>{endElement}</div>
        </>
      ),
    },
  });
