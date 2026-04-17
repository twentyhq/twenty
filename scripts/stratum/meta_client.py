"""
Thin client for the Twenty metadata GraphQL API (/metadata endpoint).
Used by migration scripts.
"""

import json
import urllib.request


class MetaClient:
    def __init__(self, api_url: str, api_key: str):
        # Accept either the workspace /graphql URL or the /metadata URL
        base = api_url.rstrip('/')
        if base.endswith('/graphql'):
            base = base[: -len('/graphql')]
        self.metadata_url = f'{base}/metadata'
        self.api_key = api_key

    def gql(self, query: str, variables: dict | None = None) -> dict:
        payload = json.dumps({'query': query, 'variables': variables or {}}).encode()
        req = urllib.request.Request(
            self.metadata_url,
            data=payload,
            headers={
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {self.api_key}',
            },
        )
        with urllib.request.urlopen(req) as resp:
            result = json.loads(resp.read())
        if 'errors' in result:
            raise RuntimeError(f"GraphQL error: {result['errors']}")
        return result['data']

    def get_all_objects(self) -> dict[str, dict]:
        """Return dict of nameSingular → {id, nameSingular, namePlural, labelSingular, isCustom}"""
        data = self.gql('{ objects(paging: { first: 500 }) { edges { node { id nameSingular namePlural labelSingular labelPlural isCustom } } } }')
        return {e['node']['nameSingular']: e['node'] for e in data['objects']['edges']}

    def get_object_fields(self, object_id: str) -> dict[str, dict]:
        """Return dict of field name → field node for a given object ID."""
        data = self.gql(
            'query GetFields($id: UUID!) { object(id: $id) { fields(paging: { first: 200 }) { edges { node { id name label type isCustom settings options } } } } }',
            {'id': object_id},
        )
        return {e['node']['name']: e['node'] for e in data['object']['fields']['edges']}

    def create_object(self, **kwargs) -> dict:
        data = self.gql(
            '''
            mutation CreateObject($input: CreateOneObjectInput!) {
              createOneObject(input: $input) { id nameSingular }
            }
            ''',
            {'input': {'object': kwargs}},
        )
        return data['createOneObject']

    def create_field(self, **kwargs) -> dict:
        data = self.gql(
            '''
            mutation CreateField($input: CreateOneFieldMetadataInput!) {
              createOneField(input: $input) { id name }
            }
            ''',
            {'input': {'field': kwargs}},
        )
        return data['createOneField']

    def get_views(self, object_metadata_id: str, key: str | None = None, view_type: str | None = None) -> list[dict]:
        """Return list of view nodes for a given objectMetadataId, optionally filtered by key and type."""
        filters = [f'objectMetadataId: {{ eq: "{object_metadata_id}" }}']
        if key:
            filters.append(f'key: {{ eq: {key} }}')
        if view_type:
            filters.append(f'type: {{ eq: {view_type} }}')
        filter_str = ', '.join(filters)
        data = self.gql(
            f'{{ views(filter: {{ {filter_str} }}, paging: {{ first: 50 }}) {{ edges {{ node {{ id name key type visibility }} }} }} }}'
        )
        return [e['node'] for e in data['views']['edges']]

    def get_view_fields(self, view_id: str) -> dict[str, dict]:
        """Return dict of fieldMetadataId → viewField node for a given view."""
        data = self.gql(
            'query GetViewFields($id: UUID!) { viewFields(filter: { viewId: { eq: $id } }, paging: { first: 200 }) { edges { node { id fieldMetadataId isVisible position size } } } }',
            {'id': view_id},
        )
        return {e['node']['fieldMetadataId']: e['node'] for e in data['viewFields']['edges']}

    def create_view_field(self, view_id: str, field_metadata_id: str, is_visible: bool, position: int, size: int = 180) -> dict:
        data = self.gql(
            '''
            mutation CreateViewField($input: CreateOneViewFieldInput!) {
              createOneViewField(input: $input) { id fieldMetadataId isVisible position size }
            }
            ''',
            {'input': {'viewField': {
                'viewId': view_id,
                'fieldMetadataId': field_metadata_id,
                'isVisible': is_visible,
                'position': position,
                'size': size,
            }}},
        )
        return data['createOneViewField']

    def update_view_field(self, view_field_id: str, **kwargs) -> dict:
        """Update a viewField. Accepts isVisible, position, size."""
        data = self.gql(
            '''
            mutation UpdateViewField($input: UpdateOneViewFieldInput!) {
              updateOneViewField(input: $input) { id fieldMetadataId isVisible position size }
            }
            ''',
            {'input': {'id': view_field_id, 'update': kwargs}},
        )
        return data['updateOneViewField']

    def update_field(self, field_id: str, **kwargs) -> dict:
        """Update a field's name, label, or other mutable properties."""
        data = self.gql(
            '''
            mutation UpdateField($input: UpdateOneFieldMetadataInput!) {
              updateOneField(input: $input) { id name label }
            }
            ''',
            {'input': {'id': field_id, 'update': kwargs}},
        )
        return data['updateOneField']

    def delete_field(self, field_id: str) -> bool:
        """Delete a field. Returns False if already gone, True if deleted."""
        try:
            self.gql(
                '''
                mutation DeleteField($input: DeleteOneFieldInput!) {
                  deleteOneField(input: $input) { id }
                }
                ''',
                {'input': {'id': field_id}},
            )
            return True
        except RuntimeError as e:
            if 'NOT_FOUND' in str(e) or 'not found' in str(e).lower():
                return False
            raise
