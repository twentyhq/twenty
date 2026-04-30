"""
Migration 014 — Add voicenotesWebhookToken field on workspaceMember + mint
the initial token for Clive.

Background:
  The Voicenotes webhook payload doesn't carry creator identity, so we route
  inbound recordings to the right Twenty user via a per-user opaque token
  embedded in the webhook URL path:
    POST /s/webhook/voicenotes/<userToken>
  This migration adds the storage field on workspaceMember and seeds Clive's
  token so we can immediately wire UAT against a real Voicenotes account.

Idempotent. Safe to re-run. Prints the resulting webhook URL so the user
can paste it into Voicenotes' webhook config.

The field lives on the *standard* workspaceMember object, so this migration
goes through the metadata GraphQL API (custom fields on standard objects
can't be added via the Twenty App SDK).

Token format: 32-char base64url-safe random string (secrets.token_urlsafe(24)
gives 32 chars). NOT marked unique in the DB — UUID-like collision odds are
negligible and an index has cost we don't need.
"""

import os
import secrets

MIGRATION_ID = '014-voicenotes-webhook-tokens'
DESCRIPTION = (
    'Add voicenotesWebhookToken TEXT field on workspaceMember + mint Clive\'s '
    'token (Voicenotes webhook URL path-param)'
)

CLIVE_EMAIL = 'clive.freeman@stratumcm.com'

# UAT host override is read from env so the run-migrations driver doesn't
# need a flag for it. Falls back to the same default the rest of this
# migrations directory uses (production).
DEFAULT_UAT_BASE = 'https://twenty-uat-0a4c.up.railway.app'


def _generate_token() -> str:
    """32-char URL-safe random string."""
    return secrets.token_urlsafe(24)


def run(client, dry_run: bool = False) -> None:
    objects = client.get_all_objects()

    wm_obj = objects.get('workspaceMember')
    if not wm_obj or not wm_obj.get('id'):
        print('  [error] workspaceMember object not found (standard object — should always exist)')
        return

    wm_object_id = wm_obj['id']

    # ── 1. Add voicenotesWebhookToken field on workspaceMember ────────────────
    fields = client.get_object_fields(wm_object_id) if not dry_run else {}

    if 'voicenotesWebhookToken' in fields:
        print('  [skip]   voicenotesWebhookToken field already exists on workspaceMember')
    else:
        print('  [create] voicenotesWebhookToken TEXT field on workspaceMember')
        if not dry_run:
            client.create_field(
                objectMetadataId=wm_object_id,
                type='TEXT',
                name='voicenotesWebhookToken',
                label='Voicenotes webhook token',
                description=(
                    'Per-user opaque token used as path parameter in the '
                    'Voicenotes webhook URL. Identifies which workspaceMember '
                    'a webhook hit belongs to.'
                ),
                isNullable=True,
                # Not isUnique=True on purpose: UUID-like collision odds are
                # negligible and the unique index has cost we don't need.
            )
            # Re-read fields so the seed step can find the new field.
            fields = client.get_object_fields(wm_object_id)

    # ── 2. Mint Clive's token (if not already set) ────────────────────────────
    # Use the per-record GraphQL API on /graphql (not /metadata) to find and
    # update the workspaceMember row. Since MetaClient only knows about
    # /metadata, we hand-roll the call via the same urlopen plumbing.
    base_url = client.metadata_url[: -len('/metadata')]
    workspace_graphql_url = f'{base_url}/graphql'

    token_to_print = _seed_clive_token(workspace_graphql_url, dry_run)

    if token_to_print is None:
        print('  [skip]   Clive\'s voicenotesWebhookToken already set — leaving as-is')
        # Best-effort: print the existing webhook URL so the user can copy it
        # without us having to re-mint. Re-read from the DB.
        existing = _read_clive_token(workspace_graphql_url)
        if existing:
            host = base_url
            print(f'         Existing webhook URL: {host}/s/webhook/voicenotes/{existing}')
    else:
        host = base_url  # /metadata stripped → host (with optional path prefix)
        print(f'  [created] Clive\'s voicenotesWebhookToken = {token_to_print}')
        print(f'           Webhook URL: {host}/s/webhook/voicenotes/{token_to_print}')


def _read_clive_token(workspace_graphql_url: str) -> str | None:
    import json
    import urllib.request

    api_key = os.environ.get('TWENTY_API_KEY', '')
    if not api_key:
        return None

    query = '''
    query FindClive($email: String!) {
      workspaceMembers(filter: { userEmail: { eq: $email } }) {
        edges { node { id voicenotesWebhookToken } }
      }
    }
    '''
    payload = json.dumps({'query': query, 'variables': {'email': CLIVE_EMAIL}}).encode()
    req = urllib.request.Request(
        workspace_graphql_url,
        data=payload,
        headers={
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {api_key}',
        },
    )
    try:
        with urllib.request.urlopen(req) as resp:
            result = json.loads(resp.read())
    except Exception as exc:
        print(f'  [warn] failed to read existing token: {exc}')
        return None

    edges = (
        result.get('data', {})
        .get('workspaceMembers', {})
        .get('edges', [])
    )
    if not edges:
        return None
    return edges[0].get('node', {}).get('voicenotesWebhookToken')


def _seed_clive_token(workspace_graphql_url: str, dry_run: bool) -> str | None:
    """Returns the newly-minted token, or None if Clive already has one set."""
    import json
    import urllib.request

    api_key = os.environ.get('TWENTY_API_KEY', '')
    if not api_key:
        print('  [error] TWENTY_API_KEY not set — cannot seed token')
        return None

    # 1. Find Clive's workspaceMember and check whether the token is already set.
    existing = _read_clive_token(workspace_graphql_url)
    if existing:
        return None  # already set; caller logs it

    # 2. Resolve the id.
    find_query = '''
    query FindClive($email: String!) {
      workspaceMembers(filter: { userEmail: { eq: $email } }) {
        edges { node { id } }
      }
    }
    '''
    find_payload = json.dumps(
        {'query': find_query, 'variables': {'email': CLIVE_EMAIL}}
    ).encode()
    req = urllib.request.Request(
        workspace_graphql_url,
        data=find_payload,
        headers={
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {api_key}',
        },
    )
    with urllib.request.urlopen(req) as resp:
        find_result = json.loads(resp.read())

    edges = (
        find_result.get('data', {})
        .get('workspaceMembers', {})
        .get('edges', [])
    )
    if not edges:
        print(f'  [error] no workspaceMember with userEmail={CLIVE_EMAIL}')
        return None

    wm_id = edges[0].get('node', {}).get('id')
    if not wm_id:
        print('  [error] workspaceMember id missing from response')
        return None

    # 3. Mint and set.
    new_token = _generate_token()

    if dry_run:
        print(f'  [DRY RUN] would set voicenotesWebhookToken on workspaceMember {wm_id} = {new_token}')
        return new_token

    update_query = '''
    mutation SetVoicenotesToken($id: UUID!, $token: String!) {
      updateWorkspaceMember(
        id: $id,
        data: { voicenotesWebhookToken: $token }
      ) {
        id
        voicenotesWebhookToken
      }
    }
    '''
    update_payload = json.dumps(
        {
            'query': update_query,
            'variables': {'id': wm_id, 'token': new_token},
        }
    ).encode()
    req = urllib.request.Request(
        workspace_graphql_url,
        data=update_payload,
        headers={
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {api_key}',
        },
    )
    with urllib.request.urlopen(req) as resp:
        update_result = json.loads(resp.read())

    if 'errors' in update_result:
        print(f'  [error] update failed: {update_result["errors"]}')
        return None

    return new_token
