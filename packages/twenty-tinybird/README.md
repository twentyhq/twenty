
## How to use
Create a virtual enviroment and install tinybird
```sh
python3 -m venv .venv
source .venv/bin/activate
pip install tinybird-cli
```
Authenticate using your admin token from your workspace
```sh
tb auth -i

** List of available regions:
[1] us-east4 (gcp) (https://app.us-east.tinybird.co)
[2] europe-west3 (gcp) (https://app.tinybird.co/gcp/europe-west3)
[3] us-east-1 (aws) (https://app.tinybird.co/aws/us-east-1)
[4] us-west-2 (aws) (https://app.tinybird.co/aws/us-west-2)
[5] eu-central-1 (aws) (https://app.tinybird.co/aws/eu-central-1) <- this
[0] Cancel

Use region [1]:
Copy the "admin your@email" token from from https://app.tinybird.co/tokens and paste it here: <pasted Token>
** Auth successful!
** Configuration written to .tinyb file, consider adding it to .gitignore
```
To sync your changes to Tinybird use:
```sh
tb push --force --push-deps
```
To pull data from Tinybird use:
```sh
tb pull
```