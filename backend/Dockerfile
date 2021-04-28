FROM node:14-alpine

WORKDIR /server

COPY ./package.json .

COPY ./yarn.lock .

RUN yarn install

COPY . .

EXPOSE 80

CMD ["yarn", "start"]
