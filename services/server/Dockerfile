# services/server/Dockerfile
#
# Twenty CRM — server (web) service
#
# Pin to an exact upstream tag. Check https://github.com/twentyhq/twenty/releases
# for the current stable version before changing this. NEVER use `latest`.
#
# IMPORTANT: services/server and services/worker MUST use the same tag.

FROM twentycrm/twenty:v2.3.2

# Twenty's official entrypoint already runs migrations on boot and starts
# the NestJS server. We don't need to override anything here; this Dockerfile
# exists only so Railway has something concrete to build.

# Railway expects services to listen on $PORT. Twenty respects NODE_PORT.
# The live crm.xopure.com domain is currently mapped to port 8080, so set
# NODE_PORT=8080 and PORT=8080 on the Railway web service.

EXPOSE 8080
