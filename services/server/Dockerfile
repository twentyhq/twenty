# services/server/Dockerfile
#
# Twenty CRM — server (web) service
#
# Pin to an exact upstream tag. Check https://github.com/twentyhq/twenty/releases
# for the current stable version before changing this. NEVER use `latest`.
#
# IMPORTANT: services/server and services/worker MUST use the same tag.

FROM twentycrm/twenty:v0.32.0

# Twenty's official entrypoint already runs migrations on boot and starts
# the NestJS server on port 3000. We don't need to override anything here —
# this Dockerfile exists only so Railway has something concrete to build.

# Railway expects services to listen on $PORT. Twenty respects NODE_PORT.
# We set NODE_PORT=$PORT at runtime via railway.toml.

EXPOSE 3000
