FROM node:22.15.1

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm ci

COPY . .

RUN npm run build

ENTRYPOINT [ "npm", "run", "start:prod" ]