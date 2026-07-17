#!/bin/bash

# UAT Jenkins Freestyle job should check out branch: develop
# Build step: ./scripts/deploy.sh uat

set -ex

ENV=$1

if [[ "$ENV" != "uat" && "$ENV" != "prod" ]]; then
    echo "Error: Invalid environment specified. Please use 'uat' or 'prod'."
    exit 1
fi

# Export the path to the gcloud SDK (same as oa-website Jenkins agent)
export PATH=$PATH:/var/lib/jenkins/google-cloud-sdk/bin

APP_NAME="oa-crm-$ENV"
DOCKER_FILE="packages/twenty-docker/twenty/Dockerfile"
DOCKER_TARGET="twenty"

TAG=$(git rev-parse --abbrev-ref HEAD | tr '/' '-')-$(git describe --always)
CURRENT_TS=$(date +%s)
FULL_TAG="${TAG}-${CURRENT_TS}"

if [ "$ENV" == "uat" ]; then
    GCR_URI="asia-south1-docker.pkg.dev/oneassure-non-prod/oneassure-non-prod"
elif [ "$ENV" == "prod" ]; then
    GCR_URI="asia-south1-docker.pkg.dev/oneassure-prod/oneassure"
fi

IMAGE_REF="${GCR_URI}/${APP_NAME}:${FULL_TAG}"

echo "Building ${IMAGE_REF}"
echo "Branch=$(git rev-parse --abbrev-ref HEAD) sha=$(git rev-parse --short HEAD)"
echo "Dockerfile=${DOCKER_FILE} target=${DOCKER_TARGET}"

# Build from repo root (twenty-crm monorepo context)
docker build \
    --target "${DOCKER_TARGET}" \
    -f "${DOCKER_FILE}" \
    -t "${IMAGE_REF}" \
    . || exit 1

docker push "${IMAGE_REF}" || exit 1

echo "=============================================="
echo "IMAGE_TAG (paste into helm-values image-tag.yaml):"
echo "${FULL_TAG}"
echo ""
echo "FULL_IMAGE_REF:"
echo "${IMAGE_REF}"
echo "=============================================="
echo ""
echo "Update helm-values file:"
echo "  core-services/teams/oa-crm/non-prod/uat/image-tag.yaml"
echo "with:"
echo "  image:"
echo "    tag: ${FULL_TAG}"

set +ex
