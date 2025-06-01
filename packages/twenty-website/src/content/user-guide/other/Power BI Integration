In this guide we will walk you through connecting Power BI to your Twenty instance.

# Prerequisite
Twenty is installed and configured already. If you need guidance on how this can be done please reference [Twenty Self Hosting]([Twenty - Self Hosting](https://twenty.com/developers/section/self-hosting)).

# Twenty Configuration
This section will walk you through what configuration steps you need to perform so that you can connect to Twenty

## Enable API Connectivity
To enable API's you must login as an admin into your twenty account and click on the Settings gear at the top left. On the bottom you will see a toggle called Advanced. Enable the advanced Features.

Now you will be presented with 3 new menus Security, API's and Webhook. Click on APIs.
Now we will need to create an API key to allow the connection. Click the Create API Key button. Give the connection a name and it will spit out a long token. Make sure to save this token in a password vault or secure document. This token will ONLY appear once.

## API Format
The format for the APIs that we will be using are as follow:

```
[protocol]://[url]:[port]/rest/[object]
	port is optional
	Example
		https://mysuperawsomeurl.com/rest/opportunities
```

If you want to learn how you can structure your API calls and queries go back to the API section as covered in [Enable API Connectivity](##enable-api-connectivity) and paste  your API token into the playground select the chore schema and REST API and click Launch.
## Network Connectivity
If your instance of twenty sits behind a firewall or reverse proxy such as nginx or traefik please make sure that your device that you will be using to connect to the Twenty server has connectivity on port 80 (not secure), 443 (secure), or 3001 (if locally hosted).

# Power BI
This section will go over the necessary steps from Power BI to connect.

## Adding Data Source
In the Power BI report click Get Data > Web. On the pop up then select Advanced. The URL parts will be the full url to your twenty endpoint as defined above.

Below you need to add the following headers:

| HTTP request header parameters | Value                   |
| ------------------------------ | ----------------------- |
| Authorization                  | Bearer [your api token] |

## Joining Tables
You will more than likely need to join multiple tables together so you can get for example the company name in your opportunities. To do this you will first add the data sources for each of the objects then follow the steps below:
**Steps:**
- Go to **Home > Transform Data** to open Power Query Editor.
- Load both data sources.
- Select one table, then click **Home > Merge Queries**.
- Choose the second table and the matching column.
- Select the type of join (e.g., Left Outer, Inner).
- Expand the merged column to include the desired fields.
