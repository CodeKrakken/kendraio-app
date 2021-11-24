#!/bin/sh -l

DEPLOYMENT_URL=$(curl --insecure -H "Content-type: application/json" -H "Authorization: Bearer $1" "https://api.vercel.com/v5/deployments?meta-githubRepo=${2}" | jq -r '.deployments[0].url')
echo $DEPLOYMENT_URL
npm install npm@latest
npm install
echo "Waiting for url to load"
npx wait-on https-get://$DEPLOYMENT_URL
echo "URL loaded, running cypress"
npx cypress run --config baseUrl="https://$DEPLOYMENT_URL"
