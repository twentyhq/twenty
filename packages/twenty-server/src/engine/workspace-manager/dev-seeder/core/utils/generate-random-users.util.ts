export type RandomUserData = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  canImpersonate: boolean;
  canAccessFullAdminPanel: boolean;
  isEmailVerified: boolean;
};

export type RandomUserWorkspaceData = {
  id: string;
  userId: string;
  workspaceId: string;
};

export type RandomWorkspaceMemberData = {
  id: string;
  nameFirstName: string;
  nameLastName: string;
  locale: string;
  colorScheme: string;
  userEmail: string;
  userId: string;
};

// Hardcoded lists of realistic names
const FIRST_NAMES = [
  'James',
  'Mary',
  'John',
  'Patricia',
  'Robert',
  'Jennifer',
  'Michael',
  'Linda',
  'William',
  'Elizabeth',
  'David',
  'Barbara',
  'Richard',
  'Susan',
  'Joseph',
  'Jessica',
  'Thomas',
  'Sarah',
  'Christopher',
  'Karen',
  'Charles',
  'Nancy',
  'Daniel',
  'Lisa',
  'Matthew',
  'Betty',
  'Anthony',
  'Helen',
  'Mark',
  'Sandra',
  'Donald',
  'Donna',
  'Steven',
  'Carol',
  'Paul',
  'Ruth',
  'Andrew',
  'Sharon',
  'Joshua',
  'Michelle',
  'Kenneth',
  'Laura',
  'Kevin',
  'Sarah',
  'Brian',
  'Kimberly',
  'George',
  'Deborah',
  'Edward',
  'Dorothy',
  'Ronald',
  'Lisa',
  'Timothy',
  'Nancy',
  'Jason',
  'Karen',
  'Jeffrey',
  'Betty',
  'Ryan',
  'Helen',
  'Jacob',
  'Sandra',
  'Gary',
  'Donna',
  'Nicholas',
  'Carol',
  'Eric',
  'Ruth',
  'Jonathan',
  'Sharon',
  'Stephen',
  'Michelle',
  'Larry',
  'Laura',
  'Justin',
  'Sarah',
  'Scott',
  'Kimberly',
  'Brandon',
  'Deborah',
  'Benjamin',
  'Dorothy',
  'Samuel',
  'Amy',
  'Gregory',
  'Angela',
  'Alexander',
  'Ashley',
  'Patrick',
  'Brenda',
  'Frank',
  'Emma',
  'Raymond',
  'Olivia',
  'Jack',
  'Cynthia',
  'Dennis',
  'Marie',
  'Jerry',
  'Janet',
  'Tyler',
  'Catherine',
  'Aaron',
  'Frances',
  'Jose',
  'Christine',
  'Henry',
  'Samantha',
  'Adam',
  'Debra',
  'Douglas',
  'Rachel',
  'Nathan',
  'Carolyn',
  'Peter',
  'Janet',
  'Zachary',
  'Virginia',
  'Kyle',
  'Maria',
  'Noah',
  'Heather',
  'Alan',
  'Diane',
  'Ethan',
  'Julie',
  'Jeremy',
  'Joyce',
  'Liam',
  'Victoria',
  'Mason',
  'Kelly',
  'Lucas',
  'Christina',
  'Logan',
  'Joan',
  'Oliver',
  'Evelyn',
  'Elijah',
  'Lauren',
  'Owen',
  'Judith',
  'Carter',
  'Megan',
  'Wyatt',
  'Cheryl',
  'Luke',
  'Andrea',
  'Jayden',
  'Hannah',
  'Gabriel',
  'Jacqueline',
  'Isaac',
  'Martha',
  'Lincoln',
  'Gloria',
  'Anthony',
  'Teresa',
  'Hudson',
  'Sara',
  'Dylan',
  'Janice',
  'Ezra',
  'Marie',
  'Thomas',
  'Julia',
  'Charles',
  'Heather',
  'Christopher',
  'Diane',
  'Jaxon',
  'Ruth',
  'Maverick',
  'Julie',
  'Josiah',
  'Joyce',
  'Cooper',
  'Virginia',
  'Leonardo',
  'Victoria',
  'Cayden',
  'Kelly',
  'Adrian',
  'Christina',
  'Miles',
  'Joan',
  'Robert',
  'Evelyn',
  'Kai',
  'Lauren',
  'Parker',
  'Judith',
  'Roman',
  'Megan',
  'Aiden',
  'Cheryl',
  'Grayson',
  'Andrea',
  'Jason',
  'Hannah',
];

const LAST_NAMES = [
  'Smith',
  'Johnson',
  'Williams',
  'Brown',
  'Jones',
  'Garcia',
  'Miller',
  'Davis',
  'Rodriguez',
  'Martinez',
  'Hernandez',
  'Lopez',
  'Gonzalez',
  'Wilson',
  'Anderson',
  'Thomas',
  'Taylor',
  'Moore',
  'Jackson',
  'Martin',
  'Lee',
  'Perez',
  'Thompson',
  'White',
  'Harris',
  'Sanchez',
  'Clark',
  'Ramirez',
  'Lewis',
  'Robinson',
  'Walker',
  'Young',
  'Allen',
  'King',
  'Wright',
  'Scott',
  'Torres',
  'Nguyen',
  'Hill',
  'Flores',
  'Green',
  'Adams',
  'Nelson',
  'Baker',
  'Hall',
  'Rivera',
  'Campbell',
  'Mitchell',
  'Carter',
  'Roberts',
  'Gomez',
  'Phillips',
  'Evans',
  'Turner',
  'Diaz',
  'Parker',
  'Cruz',
  'Edwards',
  'Collins',
  'Reyes',
  'Stewart',
  'Morris',
  'Morales',
  'Murphy',
  'Cook',
  'Rogers',
  'Gutierrez',
  'Ortiz',
  'Morgan',
  'Cooper',
  'Peterson',
  'Bailey',
  'Reed',
  'Kelly',
  'Howard',
  'Ramos',
  'Kim',
  'Cox',
  'Ward',
  'Richardson',
  'Watson',
  'Brooks',
  'Chavez',
  'Wood',
  'James',
  'Bennett',
  'Gray',
  'Mendoza',
  'Ruiz',
  'Hughes',
  'Price',
  'Alvarez',
  'Castillo',
  'Sanders',
  'Patel',
  'Myers',
  'Long',
  'Ross',
  'Foster',
  'Jimenez',
  'Powell',
  'Jenkins',
  'Perry',
  'Russell',
  'Sullivan',
  'Bell',
  'Coleman',
  'Butler',
  'Henderson',
  'Barnes',
  'Gonzales',
  'Fisher',
  'Vasquez',
  'Simmons',
  'Romero',
  'Jordan',
  'Patterson',
  'Alexander',
  'Hamilton',
  'Graham',
  'Reynolds',
  'Griffin',
  'Wallace',
  'Moreno',
  'West',
  'Cole',
  'Hayes',
  'Bryant',
  'Herrera',
  'Gibson',
  'Ellis',
  'Tran',
  'Medina',
  'Aguilar',
  'Stevens',
  'Murray',
  'Ford',
  'Castro',
  'Marshall',
  'Owens',
  'Harrison',
  'Fernandez',
  'Mcdonald',
  'Woods',
  'Washington',
  'Kennedy',
  'Wells',
  'Vargas',
  'Henry',
  'Chen',
  'Freeman',
  'Webb',
  'Tucker',
  'Guzman',
  'Burns',
  'Crawford',
  'Olson',
  'Simpson',
  'Porter',
  'Hunter',
  'Gordon',
  'Mendez',
  'Silva',
  'Shaw',
  'Snyder',
  'Mason',
  'Dixon',
  'Munoz',
  'Hunt',
  'Hicks',
  'Holmes',
  'Palmer',
  'Wagner',
  'Black',
  'Robertson',
  'Boyd',
  'Rose',
  'Stone',
  'Salazar',
  'Fox',
  'Warren',
  'Mills',
  'Meyer',
  'Rice',
  'Schmidt',
  'Garza',
  'Daniels',
  'Ferguson',
  'Nichols',
  'Stephens',
  'Soto',
  'Weaver',
  'Ryan',
  'Gardner',
  'Payne',
  'Grant',
  'Dunn',
  'Kelley',
  'Spencer',
  'Hawkins',
];

const COLOR_SCHEMES = ['Light', 'Dark', 'System'];

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;

  return x - Math.floor(x);
}

export function generateRandomUsers(): {
  users: RandomUserData[];
  userWorkspaces: RandomUserWorkspaceData[];
  workspaceMembers: RandomWorkspaceMemberData[];
  userIds: Record<string, string>;
  userWorkspaceIds: Record<string, string>;
  workspaceMemberIds: Record<string, string>;
} {
  const users: RandomUserData[] = [];
  const userWorkspaces: RandomUserWorkspaceData[] = [];
  const workspaceMembers: RandomWorkspaceMemberData[] = [];
  const userIds: Record<string, string> = {};
  const userWorkspaceIds: Record<string, string> = {};
  const workspaceMemberIds: Record<string, string> = {};

  const passwordHash =
    '$2b$10$3LwXjJRtLsfx4hLuuXhxt.3mWgismTiZFCZSG3z9kDrSfsrBl0fT6';

  for (let i = 1; i <= 1000; i++) {
    // Generate deterministic random indices for names
    const firstNameIndex = Math.floor(
      seededRandom(i * 1000) * FIRST_NAMES.length,
    );
    const lastNameIndex = Math.floor(
      seededRandom(i * 2000) * LAST_NAMES.length,
    );
    const colorSchemeIndex = Math.floor(
      seededRandom(i * 3000) * COLOR_SCHEMES.length,
    );

    const firstName = FIRST_NAMES[firstNameIndex];
    const lastName = LAST_NAMES[lastNameIndex];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@apple.dev`;

    // Generate consistent UUIDs based on index
    const userId =
      `30303030-${i.toString().padStart(4, '0')}-4000-8000-000000000000`.replace(
        /0{4}-4000-8000-000000000000$/,
        () => {
          const hex = (i * 12345).toString(16).padStart(12, '0').slice(0, 12);

          return `${hex.slice(0, 4)}-4000-8000-${hex.slice(4, 12)}`;
        },
      );

    const userWorkspaceId =
      `31313131-${i.toString().padStart(4, '0')}-4000-8000-000000000000`.replace(
        /0{4}-4000-8000-000000000000$/,
        () => {
          const hex = (i * 23456).toString(16).padStart(12, '0').slice(0, 12);

          return `${hex.slice(0, 4)}-4000-8000-${hex.slice(4, 12)}`;
        },
      );

    const workspaceMemberId =
      `32323232-${i.toString().padStart(4, '0')}-4000-8000-000000000000`.replace(
        /0{4}-4000-8000-000000000000$/,
        () => {
          const hex = (i * 34567).toString(16).padStart(12, '0').slice(0, 12);

          return `${hex.slice(0, 4)}-4000-8000-${hex.slice(4, 12)}`;
        },
      );

    userIds[`RANDOM_USER_${i}`] = userId;
    userWorkspaceIds[`RANDOM_USER_WORKSPACE_${i}`] = userWorkspaceId;
    workspaceMemberIds[`RANDOM_WORKSPACE_MEMBER_${i}`] = workspaceMemberId;

    users.push({
      id: userId,
      firstName,
      lastName,
      email,
      passwordHash,
      canImpersonate: false,
      canAccessFullAdminPanel: false,
      isEmailVerified: true,
    });

    userWorkspaces.push({
      id: userWorkspaceId,
      userId,
      workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419', // SEED_APPLE_WORKSPACE_ID
    });

    workspaceMembers.push({
      id: workspaceMemberId,
      nameFirstName: firstName,
      nameLastName: lastName,
      locale: 'en',
      colorScheme: COLOR_SCHEMES[colorSchemeIndex],
      userEmail: email,
      userId,
    });
  }

  return {
    users,
    userWorkspaces,
    workspaceMembers,
    userIds,
    userWorkspaceIds,
    workspaceMemberIds,
  };
}
