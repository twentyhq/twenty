import React, { useEffect, useState } from 'react';

import { button, div, h3, p } from '../generated/components';

const FrontComponent = () => {
  const [clickCount, setClickCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString(),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return React.createElement(
    div,
    null,
    React.createElement(h3, null, 'Remote DOM front component'),
    React.createElement(
      p,
      null,
      'Rendered in a web worker and mirrored on the host.',
    ),
    React.createElement(
      button,
      { onClick: () => setClickCount(clickCount + 1) },
      'Click me',
    ),
    React.createElement(
      p,
      null,
      'Clicked ',
      clickCount,
      ' time',
      clickCount === 1 ? '' : 's',
    ),
    React.createElement(p, null, 'Current time: ', currentTime),
  );
};

export default React.createElement(FrontComponent);
