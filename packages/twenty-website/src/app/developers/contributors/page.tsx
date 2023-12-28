import Image from 'next/image';

interface Contributor {
  login: string;
  avatar_url: string;
  contributions: number;
}

const Contributors = async () => {
  const res = await fetch(
    'https://api.github.com/repos/twentyhq/twenty/contributors',
  );
  const contributors = await res.json();

  return (
    <div>
      <h1>Top Contributors</h1>
      <ul>
        {contributors.map((contributor: Contributor, index: number) => (
          <li key={index}>
            <Image
              src={contributor.avatar_url}
              alt={contributor.login}
              width="50"
              height="50"
            />
            <p>
              {contributor.login} (Contributions: {contributor.contributions})
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Contributors;
