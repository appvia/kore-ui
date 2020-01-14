FROM node:12-alpine3.10

ENV NODE_ENV production

WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm install
COPY . .
RUN npm run build

CMD [ "npm", "start" ]
