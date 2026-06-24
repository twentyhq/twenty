export default {
  name: "Returnista - New Shipment Delivered",
  version: "0.0.1",
  key: "returnista-new-shipment-delivered",
  description: "Emit new event when a Returnista shipment is marked as Delivered. Deduplicates identical events for the same shipment.",
  type: "source",
  props: {
    // Generates a unique endpoint URL for this component to receive webhooks
    http: "$.interface.http",
    db: "$.service.db",
    // Optional secret for webhook signature verification (if Returnista provides one)
    webhookSecret: {
      type: "string",
      label: "Webhook Secret",
      description: "Optional secret to verify the webhook payload signature.",
      optional: true,
    },
  },
  methods: {
    _getProcessedShipments() {
      // Returns the cache object or an empty object if it doesn't exist
      return this.db.get("processedShipments") || {};
    },
    _setProcessedShipments(shipments) {
      this.db.set("processedShipments", shipments);
    },
    _enforceCacheLimit(shipments) {
      // Cache Eviction: Prevent this.$db from growing infinitely
      // Pipedream $db keys have size limits. Keeping 1000 items ensures we stay well within limits.
      const MAX_ITEMS = 1000;
      const keys = Object.keys(shipments);

      if (keys.length > MAX_ITEMS) {
        // Sort by the timestamp value (oldest first)
        const sortedKeys = keys.sort((a, b) => shipments[a] - shipments[b]);
        // Isolate the oldest keys to delete
        const keysToDelete = sortedKeys.slice(0, keys.length - MAX_ITEMS);
        for (const key of keysToDelete) {
          delete shipments[key];
        }
      }
      return shipments;
    },
  },
  async run(event) {
    const { body, headers } = event;

    /*
      Optional: Signature Verification
      if (this.webhookSecret) {
        const signature = headers["x-returnista-signature"];
        // Verify HMAC signature using crypto here to ensure payload authenticity
      }
    */

    // Edge Case: Handle malformed payloads missing required metadata
    if (!body || !body.shipment_id || !body.status) {
      console.log("Malformed payload: Missing 'shipment_id' or 'status'. Skipping...");
      return;
    }

    const { shipment_id: shipmentId, status } = body;

    // Filter out any events that are not "Delivered"
    if (status !== "Delivered") {
      console.log(`Shipment ${shipmentId} status is "${status}". Skipping...`);
      return;
    }

    // Fetch the cache of previously processed delivered shipment IDs
    let processedShipments = this._getProcessedShipments();

    // Deduplication check
    if (processedShipments[shipmentId]) {
      console.log(`Shipment ${shipmentId} was already processed as Delivered. Deduplicating...`);
      return;
    }

    // Store the shipment ID with the current timestamp (used for cache eviction later)
    processedShipments[shipmentId] = Date.now();

    // Evict old records if the cache has exceeded MAX_ITEMS
    processedShipments = this._enforceCacheLimit(processedShipments);

    // Save the updated cache state back to this.$db
    this._setProcessedShipments(processedShipments);

    // Emit the event to Pipedream workflows
    // Pipedream natively deduplicates events if they share the exact same `id` metadata
    this.$emit(body, {
      id: `${shipmentId}-${status}`,
      summary: `Shipment ${shipmentId} Delivered`,
      ts: Date.now(),
    });
  },
};
