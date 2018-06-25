FROM node:8
WORKDIR /usr/src/app
COPY package.json .
RUN npm install --only=production
COPY src/ .
EXPOSE 8080
CMD [ "npm", "start" ]
