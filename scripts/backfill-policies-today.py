#!/usr/bin/env python3
"""
Targeted policy backfill: import only today's policies from old CRM.

Usage:
  python3 scripts/backfill-policies-today.py                 # Backfill today
  python3 scripts/backfill-policies-today.py --date 2026-02-17  # Specific date
  python3 scripts/backfill-policies-today.py --dry-run        # Preview only
"""

import json
import sys
import time
import requests

sys.stdout.reconfigure(line_buffering=True) if hasattr(sys.stdout, 'reconfigure') else None

# === CONFIG ===
OLD_CRM_BASE = "https://omnia.geogrowth.com/api/orgadmin"
NEW_CRM_GQL = "https://crm.omniaagent.com/graphql"
NEW_CRM_TOKEN = open("/tmp/twenty-token.txt").read().strip()

NEW_HEADERS = {
    "Authorization": f"Bearer {NEW_CRM_TOKEN}",
    "Content-Type": "application/json",
}

DELAY = 0.02

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
phone_cache = {}
carrier_cache = {}
product_cache = {}
agent_cache = {}

stats = {"created": 0, "skipped": 0, "failed": 0, "no_person": 0}
dry_run = False


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


def normalize_phone(phone_str):
    if not phone_str:
        return None
    digits = "".join(c for c in str(phone_str) if c.isdigit())
    if len(digits) == 11 and digits.startswith("1"):
        digits = digits[1:]
    return digits if digits else None


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


def create_person_from_policy(policy):
    """Create a minimal Person record from policy data so the policy can link."""
    first = (policy.get("first_name") or "").strip().title()
    last = (policy.get("last_name") or "").strip().title()
    phone = normalize_phone(policy.get("phone"))
    email = (policy.get("email") or "").strip()
    city = (policy.get("city") or "").strip()
    state = (policy.get("state_name") or "").strip()
    zipcode = (policy.get("zipcode") or "").strip()

    inp = {
        "name": {"firstName": first, "lastName": last},
        "phones": {"primaryPhoneNumber": phone, "primaryPhoneCallingCode": "+1"},
    }

    if email and "@" in email and email.lower() not in {
        "none@none.com", "test@test.com", "n/a@n/a.com", "na@na.com",
        "noemail@noemail.com", "no@email.com", "none@gmail.com", "none@email.com",
        "fake@fakemail.com",
    }:
        inp["emails"] = {"primaryEmail": email.lower()}

    if city or state or zipcode:
        addr = {"addressCountry": "United States"}
        if city:
            addr["addressCity"] = city
        if state:
            addr["addressState"] = state
        if zipcode:
            addr["addressPostcode"] = zipcode
        inp["addressCustom"] = addr

    # Link to agent
    agent_name = policy.get("member_name")
    if agent_name:
        aid = find_agent_by_name(agent_name)
        if aid:
            inp["assignedAgentId"] = aid

    inp["leadStatus"] = "CONTACTED"

    data, err = gql("""
        mutation($input: PersonCreateInput!) {
            createPerson(data: $input) { id }
        }
    """, {"input": inp})

    if data:
        pid = data["createPerson"]["id"]
        phone_cache[phone] = pid
        print(f"    -> Created lead: {first} {last} ({phone})")
        return pid

    # Handle duplicate email — retry without email
    if err and "duplicate" in str(err).lower():
        inp.pop("emails", None)
        data2, err2 = gql("""
            mutation($input: PersonCreateInput!) {
                createPerson(data: $input) { id }
            }
        """, {"input": inp})
        if data2:
            pid = data2["createPerson"]["id"]
            phone_cache[phone] = pid
            print(f"    -> Created lead (no email): {first} {last} ({phone})")
            return pid

    err_msg = err[0]["message"] if err else "unknown"
    print(f"    -> FAIL creating lead {first} {last}: {err_msg[:100]}")
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

    if dry_run:
        carrier_cache[name] = "dry-run-carrier"
        return "dry-run-carrier"

    data, err = gql("""
        mutation($input: CarrierCreateInput!) {
            createCarrier(data: $input) { id }
        }
    """, {"input": {"name": name}})

    if data:
        cid = data["createCarrier"]["id"]
        carrier_cache[name] = cid
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

    if dry_run:
        product_cache[name] = "dry-run-product"
        return "dry-run-product"

    data, err = gql("""
        mutation($input: ProductCreateInput!) {
            createProduct(data: $input) { id }
        }
    """, {"input": {"name": name}})

    if data:
        pid = data["createProduct"]["id"]
        product_cache[name] = pid
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


def find_policy_by_application_id(app_id):
    """Cross-reference dedup: check if a policy exists with this applicationId."""
    data, _ = gql("""
        query($filter: PolicyFilterInput) {
            policies(filter: $filter, first: 1) {
                edges { node { id } }
            }
        }
    """, {"filter": {"applicationId": {"eq": app_id}}})

    if data and data["policies"]["edges"]:
        return data["policies"]["edges"][0]["node"]["id"]
    return None


def fetch_todays_policies(target_date):
    """Fetch ALL policies from old CRM, filter to target_date by reg_date."""
    print(f"Fetching policies for {target_date} from old CRM...")
    page = 1
    today_policies = []
    total_pages = 1

    while page <= total_pages:
        resp = requests.get(
            f"{OLD_CRM_BASE}/lead-report-api",
            params={"page": page, "per_page": 10},
            headers={"Accept": "application/json"},
            timeout=15,
        )
        if not resp.ok:
            print(f"  API error on page {page}: {resp.status_code}")
            break

        data = resp.json()
        response = data.get("response", {})
        policies = response.get("data", [])
        total_pages = response.get("total_page", 1)

        for p in policies:
            rd = (p.get("reg_date") or "")[:10]
            if rd == target_date:
                today_policies.append(p)

        # Early exit once we're past today's policies
        if policies and all(
            (p.get("reg_date") or "")[:10] < target_date for p in policies
        ):
            break

        if page % 10 == 0:
            print(f"  Scanned page {page}/{total_pages}, found {len(today_policies)} so far...")

        page += 1

    print(f"  Found {len(today_policies)} policies for {target_date}")
    return today_policies


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

    # Pass reg_date as-is (EST) — no timezone conversion
    reg_date = policy.get("reg_date")
    if reg_date and reg_date != "0000-00-00":
        inp["submittedDate"] = reg_date

    return inp


def main():
    global dry_run

    target_date = time.strftime("%Y-%m-%d")  # default: today

    args = sys.argv[1:]
    if "--dry-run" in args:
        dry_run = True
        args.remove("--dry-run")
    if "--date" in args:
        idx = args.index("--date")
        target_date = args[idx + 1]
        args = args[:idx] + args[idx + 2:]

    print("=" * 60)
    print(f"POLICY BACKFILL: {target_date} only")
    if dry_run:
        print("*** DRY RUN — no writes ***")
    print("=" * 60)

    # Fetch today's policies from old CRM
    policies = fetch_todays_policies(target_date)
    if not policies:
        print("No policies found. Exiting.")
        return

    # Process each policy
    for i, policy in enumerate(policies, 1):
        old_id = str(policy.get("policy_id", ""))
        phone = normalize_phone(policy.get("phone"))
        first = policy.get("first_name", "")
        last = policy.get("last_name", "")
        agent = policy.get("member_name", "")
        policy_num = policy.get("policy_number", "")

        # Cross-reference dedup: skip if policy_number matches an existing
        # policy's applicationId (agents enter HealthSherpa app IDs as
        # policy numbers in the old CRM)
        if policy_num and find_policy_by_application_id(policy_num):
            stats["skipped"] += 1
            continue

        if not phone:
            print(f"  [{i}/{len(policies)}] SKIP {first} {last} — no phone")
            stats["no_person"] += 1
            continue

        person_id = find_person_by_phone(phone)
        if not person_id:
            if dry_run:
                print(f"  [{i}/{len(policies)}] NO LEAD {first} {last} ({phone}) — would create")
                stats["no_person"] += 1
                stats["created"] += 1
                continue
            # Auto-create the person from policy data
            person_id = create_person_from_policy(policy)
            if not person_id:
                stats["no_person"] += 1
                continue

        if dry_run:
            print(
                f"  [{i}/{len(policies)}] CREATE {policy_num} | {first} {last} | "
                f"Agent={agent} | {policy.get('carrier_name')} | {policy.get('product_name')}"
            )
            stats["created"] += 1
            continue

        inp = build_policy_input(policy, person_id)
        result, err = gql("""
            mutation($input: PolicyCreateInput!) {
                createPolicy(data: $input) { id }
            }
        """, {"input": inp})

        if result:
            stats["created"] += 1
            if i % 10 == 0 or i == len(policies):
                print(f"  [{i}/{len(policies)}] created={stats['created']} failed={stats['failed']} no_person={stats['no_person']}")
        else:
            stats["failed"] += 1
            err_msg = err[0]["message"] if err else "unknown"
            print(f"  [{i}/{len(policies)}] FAIL {policy_num} {first} {last}: {err_msg[:150]}")

    print()
    print("=" * 60)
    print(f"POLICY BACKFILL COMPLETE ({target_date})")
    print("=" * 60)
    print(f"  Target:     {len(policies)} policies from old CRM")
    print(f"  Created:    {stats['created']}")
    print(f"  Skipped:    {stats['skipped']} (already exists by applicationId)")
    print(f"  No person:  {stats['no_person']} (lead not found in CRM)")
    print(f"  Failed:     {stats['failed']}")
    print("=" * 60)


if __name__ == "__main__":
    main()
