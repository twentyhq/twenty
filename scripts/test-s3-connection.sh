#!/bin/bash

# Test S3 connection and bucket access

BUCKET_NAME="${STORAGE_S3_NAME:-twenty-crm-storage}"
REGION="${STORAGE_S3_REGION:-us-east-1}"

echo "Testing S3 connection..."
echo "Bucket: $BUCKET_NAME"
echo "Region: $REGION"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not installed. Install with: pip install awscli"
    exit 1
fi

# Test bucket access
if aws s3 ls "s3://$BUCKET_NAME" --region "$REGION" 2>/dev/null; then
    echo "✓ Successfully connected to S3 bucket"
else
    echo "❌ Cannot access bucket. Creating it..."
    if aws s3 mb "s3://$BUCKET_NAME" --region "$REGION"; then
        echo "✓ Bucket created successfully"

        # Enable versioning
        aws s3api put-bucket-versioning \
            --bucket "$BUCKET_NAME" \
            --versioning-configuration Status=Enabled \
            --region "$REGION"
        echo "✓ Versioning enabled"

        # Block public access
        aws s3api put-public-access-block \
            --bucket "$BUCKET_NAME" \
            --public-access-block-configuration \
            "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true" \
            --region "$REGION"
        echo "✓ Public access blocked"
    else
        echo "❌ Failed to create bucket"
        exit 1
    fi
fi

# Test write access
TEST_FILE="/tmp/twenty-test-$(date +%s).txt"
echo "Test file" > "$TEST_FILE"

if aws s3 cp "$TEST_FILE" "s3://$BUCKET_NAME/test/" --region "$REGION"; then
    echo "✓ Write access confirmed"
    aws s3 rm "s3://$BUCKET_NAME/test/$(basename $TEST_FILE)" --region "$REGION"
    rm "$TEST_FILE"
else
    echo "❌ Write access failed"
    exit 1
fi

echo ""
echo "✓ S3 configuration is valid!"
