FROM node:9-alpine
MAINTAINER fabio@adamassoft.it

WORKDIR /usr/src/app
COPY . .

RUN npm install

EXPOSE 8080

CMD [ "npm", "start" ]