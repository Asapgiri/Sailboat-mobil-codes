# Docker image creation to run this project

FROM node

WORKDIR /app
COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm install

COPY . .

CMD [ "npm", "run", "dev" ]
