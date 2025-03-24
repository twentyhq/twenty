# Twenty Analytics

This project utilizes Tinybird Forward to efficiently manage real-time data streams and analytics.

## Getting Started

### Install Tinybird Forward

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
```
tb dev
```
   
## Contribute

### Create a Datasource

1. Create a new datasource by uploading your data file:
   ```bash
   tiny datasource create your-datasource-name your-data-file.csv
   ```
2. You can also update an existing datasource using:
   ```bash
   tiny datasource update your-datasource-name your-updated-data-file.csv
   ```

### Add a New Pipe

1. Create a new pipe:
   ```bash
   tiny pipe create your-pipe-name
   ```
2. Edit the pipe file with your desired SQL transformations and then publish the pipe:
   ```bash
   tiny pipe publish your-pipe-name
   ```