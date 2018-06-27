FROM node:8
WORKDIR /usr/src/app
COPY ./package*.json ./
RUN npm install --only=production
COPY ./src/ ./src
CMD [ "node", "./src/Main.js" ]
