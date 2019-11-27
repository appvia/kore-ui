# Hub UI

The UI is build using next.js with an ExpressJS server.

### Install and run

Clone with mock API server from https://github.com/appvia/hub-apis-mock and run that on port 9000.

Then install and run the Hub UI as follows

```bash
npm install
npm run dev
```

**Production**

To run in production mode, do the following

```bash
npm run build
npm start
```

### Docker compose

To run all services for the hub together you can use the docker-compose file

```bash
# clone the APIs repo
git clone git@github.com:appvia/hub-apis.git
docker-compose up -d
# deploy the CRDs for the hub
KUBECONFIG="none" kubectl apply -f ../hub-apis/deploy --validate=false
```

Visit http://localhost:3000 in the browser to use the hub.
