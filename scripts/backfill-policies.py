#!/usr/bin/env python3
"""
One-time backfill: import all policies from old CRM's lead-report-api into new CRM.

Usage:
  python3 scripts/backfill-policies.py               # Full backfill
  python3 scripts/backfill-policies.py --sample 50    # Test with 50 policies
  python3 scripts/backfill-policies.py --page 30      # Resume from page 30
"""

import json
import sys
import time
import requests

# === CONFIG ===
OLD_CRM_BASE = "https://omnia.geogrowth.com/api/orgadmin"
NEW_CRM_GQL = "https://crm.omniaagent.com/graphql"
NEW_CRM_TOKEN = open("/tmp/twenty-token.txt").read().strip()

NEW_HEADERS = {
    "Authorization": f"Bearer {NEW_CRM_TOKEN}",
    "Content-Type": "application/json",
}

PER_PAGE = 10  # API ignores per_page param, always returns 10
DELAY = 0.02  # seconds between CRM writes

POLICY_STATUS_NAME_MAP = {
    "submitted": "SUBMITTED",
    "pending": "PENDING",
    "declined": "DECLINED",
    "canceled": "CANCELED",
    "incomplete": "INCOMPLETE",
    "active / approved": "ACTIVE_APPROVED",
    "active/approved": "ACTIVE_APPROVED",
    "active / placed": "ACTIVE_PLACED",
    "active/placed": "ACTIVE_PLACED",
    "active - approved": "ACTIVE_APPROVED",
    "active - placed": "ACTIVE_PLACED",
    "active": "ACTIVE",
    "payment error - canceled": "PAYMENT_ERROR_CANCELED",
    "payment error - active/approved": "PAYMENT_ERROR_ACTIVE_APPROVED",
    "payment error - active/placed": "PAYMENT_ERROR_ACTIVE_PLACED",
    "payment error - active approved": "PAYMENT_ERROR_ACTIVE_APPROVED",
    "payment error - active placed": "PAYMENT_ERROR_ACTIVE_PLACED",
}

# Caches
phone_cache = {}       # phone_digits -> person_id
carrier_cache = {}     # carrier_name -> carrier_id
product_cache = {}     # product_name -> product_id
agent_cache = {}       # agent_name -> agent_id
lead_source_cache = {} # source_name -> lead_source_id
synced_policies = set()  # old policy IDs already in CRM

# Stats
stats = {"created": 0, "skipped": 0, "failed": 0, "no_person": 0}


def gql(query, variables=None):
    payload = {"query": query}
    if variables:
        payload["variables"] = variables
    resp = requests.post(NEW_CRM_GQL, headers=NEW_HEADERS, json=payload, timeout=30)
    time.sleep(DELAY)
    data = resp.json()
    if "errors" in data:
        return None, data["errors"]
    return data.get("data"), None


def find_person_by_phone(phone_digits):
    if phone_digits in phone_cache:
        return phone_cache[phone_digits]

    data, err = gql("""
        query($filter: PersonFilterInput) {
            people(filter: $filter, first: 1) {
                edges { node { id } }
            }
        }
    """, {"filter": {"phones": {"primaryPhoneNumber": {"eq": phone_digits}}}})

    if data and data["people"]["edges"]:
        pid = data["people"]["edges"][0]["node"]["id"]
        phone_cache[phone_digits] = pid
        return pid

    phone_cache[phone_digits] = None
    return None


def find_or_create_carrier(name):
    if name in carrier_cache:
        return carrier_cache[name]

    data, _ = gql("""
        query($filter: CarrierFilterInput) {
            carriers(filter: $filter, first: 1) {
                edges { node { id } }
            }
        }
    """, {"filter": {"name": {"eq": name}}})

    if data and data["carriers"]["edges"]:
        cid = data["carriers"]["edges"][0]["node"]["id"]
        carrier_cache[name] = cid
        return cid

    data, err = gql("""
        mutation($input: CarrierCreateInput!) {
            createCarrier(data: $input) { id }
        }
    """, {"input": {"name": name}})

    if data:
        cid = data["createCarrier"]["id"]
        carrier_cache[name] = cid
        print(f"  Created carrier: {name}")
        return cid

    carrier_cache[name] = None
    return None


def find_or_create_product(name):
    if name in product_cache:
        return product_cache[name]

    data, _ = gql("""
        query($filter: ProductFilterInput) {
            products(filter: $filter, first: 1) {
                edges { node { id } }
            }
        }
    """, {"filter": {"name": {"eq": name}}})

    if data and data["products"]["edges"]:
        pid = data["products"]["edges"][0]["node"]["id"]
        product_cache[name] = pid
        return pid

    data, err = gql("""
        mutation($input: ProductCreateInput!) {
            createProduct(data: $input) { id }
        }
    """, {"input": {"name": name}})

    if data:
        pid = data["createProduct"]["id"]
        product_cache[name] = pid
        print(f"  Created product: {name}")
        return pid

    product_cache[name] = None
    return None


def find_agent_by_name(name):
    if name in agent_cache:
        return agent_cache[name]

    data, _ = gql("""
        query($filter: AgentProfileFilterInput) {
            agentProfiles(filter: $filter, first: 1) {
                edges { node { id } }
            }
        }
    """, {"filter": {"name": {"like": f"%{name}%"}}})

    if data and data["agentProfiles"]["edges"]:
        aid = data["agentProfiles"]["edges"][0]["node"]["id"]
        agent_cache[name] = aid
        return aid

    agent_cache[name] = None
    return None


def find_or_create_lead_source(name):
    if name in lead_source_cache:
        return lead_source_cache[name]

    data, _ = gql("""
        query($filter: LeadSourceFilterInput) {
            leadSources(filter: $filter, first: 1) {
                edges { node { id } }
            }
        }
    """, {"filter": {"name": {"eq": name}}})

    if data and data["leadSources"]["edges"]:
        sid = data["leadSources"]["edges"][0]["node"]["id"]
        lead_source_cache[name] = sid
        return sid

    data, err = gql("""
        mutation($input: LeadSourceCreateInput!) {
            createLeadSource(data: $input) { id }
        }
    """, {"input": {"name": name}})

    if data:
        sid = data["createLeadSource"]["id"]
        lead_source_cache[name] = sid
        print(f"  Created lead source: {name}")
        return sid

    lead_source_cache[name] = None
    return None


def find_policy_by_old_id(old_id):
    data, _ = gql("""
        query($filter: PolicyFilterInput) {
            policies(filter: $filter, first: 1) {
                edges { node { id } }
            }
        }
    """, {"filter": {"oldCrmPolicyId": {"eq": old_id}}})

    if data and data["policies"]["edges"]:
        return data["policies"]["edges"][0]["node"]["id"]
    return None


def load_existing_policy_ids():
    """Pre-load all oldCrmPolicyId values already in the CRM for fast dedup."""
    print("Loading existing policies from CRM...")
    cursor = None
    count = 0
    while True:
        after = f', after: "{cursor}"' if cursor else ""
        data, err = gql(f"""
            query {{
                policies(first: 500{after}) {{
                    pageInfo {{ hasNextPage endCursor }}
                    edges {{ node {{ oldCrmPolicyId }} }}
                }}
            }}
        """)
        if not data:
            break
        result = data["policies"]
        for edge in result["edges"]:
            oid = edge["node"].get("oldCrmPolicyId")
            if oid:
                synced_policies.add(oid)
                count += 1
        if not result["pageInfo"]["hasNextPage"]:
            break
        cursor = result["pageInfo"]["endCursor"]
    print(f"  Found {count} existing policies with oldCrmPolicyId")


def normalize_phone(phone_str):
    if not phone_str:
        return None
    digits = "".join(c for c in phone_str if c.isdigit())
    if len(digits) == 11 and digits.startswith("1"):
        digits = digits[1:]
    return digits if digits else None


def build_policy_input(policy, person_id):
    policy_number = policy.get("policy_number") or ""
    product_name = policy.get("product_name") or ""
    carrier_name = policy.get("carrier_name") or ""

    # Build display name: "Carrier - Product" (best effort from old CRM data)
    if carrier_name and product_name:
        display_name = f"{carrier_name} - {product_name}"
    elif carrier_name:
        display_name = f"{carrier_name} - Unknown"
    elif product_name:
        display_name = f"Unknown - {product_name}"
    else:
        display_name = "Policy"

    inp = {
        "name": display_name,
        "policyNumber": policy_number,
        "leadId": person_id,
        "oldCrmPolicyId": str(policy["policy_id"]),
    }

    premium_str = policy.get("total_premium")
    if premium_str:
        try:
            premium = float(premium_str)
            if premium > 0:
                inp["premium"] = {
                    "amountMicros": round(premium * 1_000_000),
                    "currencyCode": "USD",
                }
        except ValueError:
            pass

    status_name = policy.get("status_name")
    if status_name:
        status = POLICY_STATUS_NAME_MAP.get(status_name.lower())
        if status:
            inp["status"] = status

    eff = policy.get("effective_date")
    if eff and eff != "0000-00-00":
        inp["effectiveDate"] = eff

    exp = policy.get("expires_date")
    if exp and exp != "0000-00-00":
        inp["expirationDate"] = exp

    if carrier_name:
        cid = find_or_create_carrier(carrier_name)
        if cid:
            inp["carrierId"] = cid

    if product_name:
        pid = find_or_create_product(product_name)
        if pid:
            inp["productId"] = pid

    agent_name = policy.get("member_name")
    if agent_name:
        aid = find_agent_by_name(agent_name)
        if aid:
            inp["agentId"] = aid

    reg_date = policy.get("reg_date")
    if reg_date and reg_date != "0000-00-00":
        inp["submittedDate"] = reg_date

    return inp


def main():
    start_page = 1
    sample_limit = 0

    args = sys.argv[1:]
    if "--sample" in args:
        idx = args.index("--sample")
        sample_limit = int(args[idx + 1])
        args = args[:idx] + args[idx + 2:]
    if "--page" in args:
        idx = args.index("--page")
        start_page = int(args[idx + 1])
        args = args[:idx] + args[idx + 2:]

    print("=" * 60)
    print("POLICY BACKFILL: lead-report-api -> CRM")
    print("=" * 60)
    if sample_limit:
        print(f"Sample mode: {sample_limit} policies")
    if start_page > 1:
        print(f"Resuming from page {start_page}")

    # Pre-load existing policies for fast dedup
    load_existing_policy_ids()

    # Fetch and process all pages
    page = start_page
    total_processed = 0

    while True:
        resp = requests.get(
            f"{OLD_CRM_BASE}/lead-report-api",
            params={"page": page, "per_page": PER_PAGE},
            headers={"Accept": "application/json"},
        )
        if not resp.ok:
            print(f"API error on page {page}: {resp.status_code}")
            break

        data = resp.json()
        response = data.get("response", {})
        policies = response.get("data", [])
        total_pages = response.get("total_page", 1)
        total = response.get("total", 0)

        if not policies:
            print(f"No data on page {page}, stopping.")
            break

        for policy in policies:
            old_id = str(policy.get("policy_id", ""))
            if not old_id:
                continue

            total_processed += 1

            # Dedup
            if old_id in synced_policies:
                stats["skipped"] += 1
                continue

            # Find person by phone
            phone = normalize_phone(policy.get("phone"))
            person_id = find_person_by_phone(phone) if phone else None
            if not person_id:
                stats["no_person"] += 1
                continue

            # Build and create
            inp = build_policy_input(policy, person_id)
            result, err = gql("""
                mutation($input: PolicyCreateInput!) {
                    createPolicy(data: $input) { id }
                }
            """, {"input": inp})

            if result:
                synced_policies.add(old_id)
                stats["created"] += 1
            else:
                stats["failed"] += 1
                if stats["failed"] <= 20:
                    err_msg = err[0]["message"] if err else "unknown"
                    print(f"  FAIL {old_id}: {err_msg[:150]}")

            if sample_limit and stats["created"] + stats["failed"] >= sample_limit:
                break

        print(
            f"  Page {page}/{total_pages} ({total} total) | "
            f"processed={total_processed} created={stats['created']} "
            f"skipped={stats['skipped']} no_person={stats['no_person']} "
            f"failed={stats['failed']}"
        )

        if sample_limit and stats["created"] + stats["failed"] >= sample_limit:
            break
        if page >= total_pages:
            break
        page += 1

    print("\n" + "=" * 60)
    print("BACKFILL COMPLETE")
    print("=" * 60)
    print(f"  Created:   {stats['created']}")
    print(f"  Skipped:   {stats['skipped']} (already in CRM)")
    print(f"  No person: {stats['no_person']} (phone not found)")
    print(f"  Failed:    {stats['failed']}")
    print("=" * 60)


if __name__ == "__main__":
    main()
