import { useRender } from '@base-ui/react/use-render';
import { clsx } from 'clsx';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { type CommandBlockProps } from './types/CommandBlockProps';

import styles from './CommandBlock.module.scss';

export const CommandBlock = ({
  commands,
  actions,
  render,
  ref,
  className,
  ...props
}: CommandBlockProps) =>
  useRender({
    render,
    ref,
    props: {
      ...props,
      className: clsx(styles.container, className),
      children: (
        <>
          <pre className={styles.commands}>
            <code>
              {commands.map((line, index) => (
                <span key={index}>
                  {index > 0 && '\n'}
                  <span className={styles.prompt} aria-hidden="true">
                    {'> '}
                  </span>
                  {line}
                </span>
              ))}
            </code>
          </pre>
          {isDefined(actions) && (
            <div className={styles.actions}>{actions}</div>
          )}
        </>
      ),
    },
  });
