# Kore UI

The UI is build using next.js with an ExpressJS server.

### Install and run

**Pre-reqs**

In a separate terminal, do the following:

```bash
# clone kore repo
git clone git@github.com:appvia/kore.git
cd kore
# build and run dependencies
make compose
# set environment variables
export DATABASE_URL="root:pass@tcp(localhost:3306)/kore?parseTime=true"
export KORE_ADMIN_PASS="password"
export KORE_ADMIN_TOKEN=password
export KORE_CERTIFICATE_AUTHORITY_KEY=hack/ca/ca-key.pem
export KORE_CERTIFICATE_AUTHORITY=hack/ca/ca.pem
export KORE_IDP_SERVER_URL="http://localhost:5556/"
export KORE_IDP_CLIENT_ID=broker
export KORE_IDP_CLIENT_SECRET=2a959c78-134f-4daa-bfef-5cfd96d45948
export KORE_IDP_CLIENT_SCOPES="email,profile,offline_access"
export KORE_AUTHENTICATION_PLUGINS=basicauth,openid,admintoken
export ENABLE_DEX="true"
export KORE_HMAC="bdT2Qg6DybsLIwc0TbYWrkGC4auovscg"
export KORE_API_PUBLIC_URL="http://127.0.0.1:10080"
export USERS_DB_URL="root:pass@tcp(localhost:3306)/kore?parseTime=true"
# run kore
bin/kore-apiserver --verbose --kube-api-server http://127.0.0.1:8080
# check it's running
curl http://localhost:10080/api/v1alpha1/whoami -H 'Authorization: Bearer password'
```

Once this is complete, you can install and run the Kore UI as follows

```bash
# run dependencies
make compose
# set environment variables
export KORE_IDP_SERVER_URL=https://<your-openid-domain>
export KORE_IDP_CLIENT_ID=<your-openid-client-id>
export KORE_IDP_CLIENT_SECRET=<your-openid-client-secret>
# install and run the UI
npm install
npm run dev
```

Visit http://localhost:3000 in the browser.
Login using the default admin user credentials: admin / password

**Production**

To run in production mode, do the following

```bash
npm install
npm run build
npm start
```
