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
npm install
npm run build
npm start
```

### Docker compose

To run all dependent services for the hub together you can use the docker-compose file

```bash
# clone the Hub API server repo
git clone git@github.com:appvia/hub-apiserver.git
# pull to ensure you have the latest image versions
docker-compose --file ../hub-apiserver/docker-compose.yml --file docker-compose.yml pull
# run docker-compose using the base compose file form the API server repo
docker-compose --file ../hub-apiserver/docker-compose.yml --file docker-compose.yml up -d
# run the UI
npm run dev
```

Visit http://localhost:3000 in the browser to use the hub.
