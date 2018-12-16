FROM node:10-alpine
MAINTAINER fabio@adamassoft.it

WORKDIR /usr/src/app
COPY . .

RUN npm install

FROM node:10-alpine

COPY --from=0 /usr/src/app /usr/src/app
WORKDIR /usr/src/app

EXPOSE 8080

CMD [ "npm", "start" ]