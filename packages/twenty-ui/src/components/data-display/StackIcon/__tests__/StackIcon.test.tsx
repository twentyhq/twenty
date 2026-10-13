import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { StackIcon } from '../StackIcon';

runComponentConformance({
  name: 'StackIcon',
  element: (
    <StackIcon
      icon={
        <svg>
          <path d="M0 0h8v8H0z" />
        </svg>
      }
      stackedIcon={
        <svg>
          <path d="M0 0h4v4H0z" />
        </svg>
      }
    />
  ),
  refInstanceOf: HTMLDivElement,
});
