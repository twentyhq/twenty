#!/usr/bin/env python3
"""
Seed CarrierProduct commission values based on product type → LTV mapping.

LTV rules (from old CRM system):
  - ACA / Major Medical: $330
  - Ancillary (dental, vision, telemedicine, accident, other): $117
  - Core (fixed indemnity, hospital, short term medical): $242
  - Health Sharing (UHF): $630

For each carrier+product pair that exists in the CRM, this script:
  1. Finds or creates the CarrierProduct record
  2. Sets commission to the appropriate LTV based on product name

Usage:
  python3 scripts/seed-carrier-product-commissions.py --target staging --dry-run
  python3 scripts/seed-carrier-product-commissions.py --target staging
  python3 scripts/seed-carrier-product-commissions.py --target production --dry-run
"""

import sys
import time
import requests

sys.stdout.reconfigure(line_buffering=True) if hasattr(sys.stdout, 'reconfigure') else None

TARGETS = {
    "staging": "https://staging-crm.omniaagent.com/graphql",
    "production": "https://crm.omniaagent.com/graphql",
}

TOKEN_FILES = {
    "staging": "/tmp/twenty-token-staging.txt",
    "production": "/tmp/twenty-token.txt",
}
NEW_CRM_TOKEN = None  # set in main()
DELAY = 0.05

dry_run = False
target_url = None

stats = {"created": 0, "updated": 0, "skipped": 0, "failed": 0}


def gql(query, variables=None):
    payload = {"query": query}
    if variables:
        payload["variables"] = variables
    headers = {
        "Authorization": f"Bearer {NEW_CRM_TOKEN}",
        "Content-Type": "application/json",
    }
    resp = requests.post(target_url, headers=headers, json=payload, timeout=30)
    time.sleep(DELAY)
    data = resp.json()
    if "errors" in data:
        return None, data["errors"]
    return data.get("data"), None


def classify_product(product_name, carrier_name=""):
    """Classify product name into type and LTV amount (micros)."""
    name = product_name.lower()
    carrier = carrier_name.lower()

    # Health Sharing (UHF / Universal Health Fellowship)
    if "health sharing" in name or "uhf" in name or "universal health fellowship" in carrier:
        return "health_sharing", 630_000_000

    # Major Medical / ACA
    if any(k in name for k in ["major medical", "aca -", "aca-"]):
        return "aca", 330_000_000

    # Auto insurance (by product name or carrier)
    if "auto" in name or "geico" in carrier or "the general" in carrier:
        return "auto", 330_000_000

    # Dental
    if "dental" in name:
        return "ancillary", 117_000_000

    # Vision
    if "vision" in name:
        return "ancillary", 117_000_000

    # Telemedicine
    if "telemedicine" in name or "telehealth" in name:
        return "ancillary", 117_000_000

    # Fixed Indemnity / Hospital
    if "hospital" in name or "fixed indemnity" in name:
        return "core", 242_000_000

    # Short Term Medical / TriTerm
    if "short term" in name or "triterm" in name or "tri-term" in name:
        return "core", 242_000_000

    # Life
    if "life" in name:
        return "core", 242_000_000

    # Accident / Critical Illness → ancillary
    if "accident" in name or "critical" in name:
        return "ancillary", 117_000_000

    # Default: ancillary
    return "ancillary", 117_000_000


def fetch_policy_carrier_product_pairs():
    """Fetch distinct carrier+product pairs that actually exist on policies."""
    seen = set()
    pairs = []
    cursor = None
    while True:
        after = f', after: "{cursor}"' if cursor else ""
        data, err = gql(f"""
            query {{
                policies(first: 100{after}, filter: {{
                    and: [
                        {{carrierId: {{is: NOT_NULL}}}},
                        {{productId: {{is: NOT_NULL}}}}
                    ]
                }}) {{
                    pageInfo {{ hasNextPage endCursor }}
                    edges {{ node {{ carrierId productId carrier {{ name }} product {{ name }} }} }}
                }}
            }}
        """)
        if not data:
            print(f"Error fetching policies: {err}")
            break
        result = data["policies"]
        for edge in result["edges"]:
            node = edge["node"]
            key = (node["carrierId"], node["productId"])
            if key not in seen:
                seen.add(key)
                pairs.append({
                    "carrierId": node["carrierId"],
                    "productId": node["productId"],
                    "carrierName": (node.get("carrier") or {}).get("name", "?"),
                    "productName": (node.get("product") or {}).get("name", "?"),
                })
        if not result["pageInfo"]["hasNextPage"]:
            break
        cursor = result["pageInfo"]["endCursor"]
    return pairs


def fetch_all_carriers():
    """Fetch all carriers from CRM."""
    carriers = []
    cursor = None
    while True:
        after = f', after: "{cursor}"' if cursor else ""
        data, err = gql(f"""
            query {{
                carriers(first: 100{after}) {{
                    pageInfo {{ hasNextPage endCursor }}
                    edges {{ node {{ id name }} }}
                }}
            }}
        """)
        if not data:
            print(f"Error fetching carriers: {err}")
            break
        result = data["carriers"]
        for edge in result["edges"]:
            carriers.append(edge["node"])
        if not result["pageInfo"]["hasNextPage"]:
            break
        cursor = result["pageInfo"]["endCursor"]
    return carriers


def fetch_all_products():
    """Fetch all products from CRM."""
    products = []
    cursor = None
    while True:
        after = f', after: "{cursor}"' if cursor else ""
        data, err = gql(f"""
            query {{
                products(first: 100{after}) {{
                    pageInfo {{ hasNextPage endCursor }}
                    edges {{ node {{ id name }} }}
                }}
            }}
        """)
        if not data:
            print(f"Error fetching products: {err}")
            break
        result = data["products"]
        for edge in result["edges"]:
            products.append(edge["node"])
        if not result["pageInfo"]["hasNextPage"]:
            break
        cursor = result["pageInfo"]["endCursor"]
    return products


def fetch_existing_carrier_products():
    """Fetch all existing CarrierProduct records with carrier/product names."""
    cps = []
    cursor = None
    while True:
        after = f', after: "{cursor}"' if cursor else ""
        data, err = gql(f"""
            query {{
                carrierProducts(first: 100{after}) {{
                    pageInfo {{ hasNextPage endCursor }}
                    edges {{ node {{
                        id carrierId productId
                        carrier {{ name }}
                        product {{ name }}
                        commission {{ amountMicros currencyCode }}
                    }} }}
                }}
            }}
        """)
        if not data:
            print(f"Error fetching carrierProducts: {err}")
            break
        result = data["carrierProducts"]
        for edge in result["edges"]:
            node = edge["node"]
            node["carrierName"] = (node.get("carrier") or {}).get("name", "?")
            node["productName"] = (node.get("product") or {}).get("name", "?")
            cps.append(node)
        if not result["pageInfo"]["hasNextPage"]:
            break
        cursor = result["pageInfo"]["endCursor"]
    return cps


def find_carrier_product(carrier_id, product_id, existing_cps):
    """Find existing CarrierProduct by carrier+product IDs."""
    for cp in existing_cps:
        if cp["carrierId"] == carrier_id and cp["productId"] == product_id:
            return cp
    return None


def create_carrier_product(carrier_id, product_id, amount_micros):
    """Create a new CarrierProduct with commission."""
    data, err = gql("""
        mutation($input: CarrierProductCreateInput!) {
            createCarrierProduct(data: $input) { id }
        }
    """, {"input": {
        "carrierId": carrier_id,
        "productId": product_id,
        "commission": {"amountMicros": amount_micros, "currencyCode": "USD"},
    }})
    return data is not None, err


def update_carrier_product(cp_id, amount_micros):
    """Update commission on existing CarrierProduct."""
    data, err = gql("""
        mutation($id: UUID!, $input: CarrierProductUpdateInput!) {
            updateCarrierProduct(id: $id, data: $input) { id }
        }
    """, {"id": cp_id, "input": {
        "commission": {"amountMicros": amount_micros, "currencyCode": "USD"},
    }})
    return data is not None, err


def main():
    global dry_run, target_url

    args = sys.argv[1:]
    if "--dry-run" in args:
        dry_run = True
        args.remove("--dry-run")

    target_name = "staging"
    if "--target" in args:
        idx = args.index("--target")
        target_name = args[idx + 1]
        args = args[:idx] + args[idx + 2:]

    if target_name not in TARGETS:
        print(f"Unknown target '{target_name}'. Use: staging, production")
        sys.exit(1)

    target_url = TARGETS[target_name]
    global NEW_CRM_TOKEN
    NEW_CRM_TOKEN = open(TOKEN_FILES[target_name]).read().strip()

    print("=" * 60)
    print(f"SEED CARRIER PRODUCT COMMISSIONS ({target_name})")
    if dry_run:
        print("*** DRY RUN — no writes ***")
    print("=" * 60)

    # Fetch all existing carrierProduct records
    print("\nFetching all carrierProduct records...")
    existing_cps = fetch_existing_carrier_products()
    print(f"  Found {len(existing_cps)} carrierProduct records")

    print(f"\nProcessing {len(existing_cps)} carrierProduct records...")

    for cp in existing_cps:
        carrier_name = cp["carrierName"]
        product_name = cp["productName"]
        display = f"{carrier_name} + {product_name}"

        product_type, ltv_micros = classify_product(product_name, carrier_name)

        existing_amount = (cp.get("commission") or {}).get("amountMicros")
        if existing_amount == ltv_micros:
            stats["skipped"] += 1
            continue

        if dry_run:
            old_val = f"${existing_amount / 1_000_000:.0f}" if existing_amount else "none"
            print(f"  WOULD UPDATE {display}: {old_val} -> ${ltv_micros / 1_000_000:.0f} ({product_type})")
            stats["updated"] += 1
        else:
            ok, err = update_carrier_product(cp["id"], ltv_micros)
            if ok:
                stats["updated"] += 1
            else:
                stats["failed"] += 1
                print(f"  FAIL updating {display}: {err}")

    print()
    print("=" * 60)
    print(f"SEED COMPLETE ({target_name})")
    print("=" * 60)
    print(f"  Created:  {stats['created']}")
    print(f"  Updated:  {stats['updated']}")
    print(f"  Skipped:  {stats['skipped']} (already correct)")
    print(f"  Failed:   {stats['failed']}")
    print("=" * 60)


if __name__ == "__main__":
    main()
