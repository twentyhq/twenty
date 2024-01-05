import Database from 'better-sqlite3';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } },
) {
  const db = new Database('db.sqlite', { readonly: true });

  if (
    params.slug !== 'users' &&
    params.slug !== 'labels' &&
    params.slug !== 'pullRequests' &&
    params.slug !== 'issues'
  ) {
    return Response.json({ error: 'Invalid table name' }, { status: 400 });
  }

  const rows = db.prepare('SELECT * FROM ' + params.slug).all();

  db.close();

  return Response.json(rows);
}
