# services/worker/Dockerfile
#
# Twenty CRM — worker service (BullMQ jobs)
#
# CRITICAL: this tag MUST match services/server/Dockerfile exactly.
# Mismatched server/worker versions cause subtle queue corruption.

FROM twentycrm/twenty:v2.3.2

# The worker runs the BullMQ consumer instead of the HTTP server.
# It does NOT run database migrations — only the server image does that.
CMD ["yarn", "worker:prod"]
