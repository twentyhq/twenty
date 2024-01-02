'use client';

/*import { API } from '@stoplight/elements';/

import '@stoplight/elements/styles.min.css';

/*
const RestApiComponent = ({ openApiJson }: { openApiJson: any }) => {
  // We load spotlightTheme style using useEffect as it breaks remaining docs style
  useEffect(() => {
    const styleElement = document.createElement('style');
    // styleElement.innerHTML = spotlightTheme.toString();
    document.head.append(styleElement);

    return () => styleElement.remove();
  }, []);

  return (
    <API apiDescriptionDocument={JSON.stringify(openApiJson)} router="hash" />
  );
};*/

const RestApi = () => {
  /* const [openApiJson, setOpenApiJson] = useState({});

  const children = <RestApiComponent openApiJson={openApiJson} />;*/

  return <>API</>;

  // return <Playground setOpenApiJson={setOpenApiJson}>{children}</Playground>;
};

export default RestApi;
