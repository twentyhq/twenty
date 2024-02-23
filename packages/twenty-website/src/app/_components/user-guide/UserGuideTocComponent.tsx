interface Heading {
  id: string;
  value: string;
}

const UserGuideTocComponent = ({ headings }: { headings: Heading[] }) => {
  return (
    <div>
      <h2>Table of Contents</h2>
      <ul>
        {headings.map((heading, index) => (
          <li key={index}>
            <a href={`#${heading.id}`}>{heading.value}</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserGuideTocComponent;
