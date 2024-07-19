import { EntityManager } from 'typeorm';

export const personPrefillData = async (
  entityManager: EntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.person`, [
      'nameFirstName',
      'nameLastName',
      'city',
      'email',
      'avatarUrl',
      'position',
    ])
    .orIgnore()
    .values([
      {
        nameFirstName: 'Brian',
        nameLastName: 'Chesky',
        city: 'San Francisco',
        email: 'chesky@airbnb.com',
        avatarUrl:
          'https://twentyhq.github.io/placeholder-images/people/image-3.png',
        position: 1,
      },
      {
        nameFirstName: 'Alexandre',
        nameLastName: 'Prot',
        city: 'Paris',
        email: 'prot@qonto.com',
        avatarUrl:
          'https://twentyhq.github.io/placeholder-images/people/image-89.png',
        position: 2,
      },
      {
        nameFirstName: 'Patrick',
        nameLastName: 'Collison',
        city: 'San Francisco',
        email: 'collison@stripe.com',
        avatarUrl:
          'https://twentyhq.github.io/placeholder-images/people/image-47.png',
        position: 3,
      },
      {
        nameFirstName: 'Dylan',
        nameLastName: 'Field',
        city: 'San Francisco',
        email: 'field@figma.com',
        avatarUrl:
          'https://twentyhq.github.io/placeholder-images/people/image-40.png',
        position: 4,
      },
      {
        nameFirstName: 'Ivan',
        nameLastName: 'Zhao',
        city: 'San Francisco',
        email: 'zhao@notion.com',
        avatarUrl:
          'https://twentyhq.github.io/placeholder-images/people/image-68.png',
        position: 5,
      },
    ])
    .returning('*')
    .execute();
};
