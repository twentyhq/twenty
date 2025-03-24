# Twenty Analytics

This project utilizes Tinybird Forward to efficiently manage real-time data streams and analytics.

## Getting Started

1. Install the Tinybird Forward CLI using:
```bash
curl https://tinybird.co | sh
```
   
2. Authenticate with the Tinybird platform:
```bash
tb auth --token "<your-token>" --host https://api.eu-central-1.aws.tinybird.co
```

3. Start the local container

```bash
    tb local start
```

4. Build and watch changes
```bash
   tb dev
```