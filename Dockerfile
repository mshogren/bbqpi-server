FROM arm32v7/node:latest
# FROM resin/raspberrypi3-node:latest

ENV NODE_ENV=production
# ENV NPM_CONFIG_PREFIX=/home/node/.npm-global

WORKDIR /app

# ADD armv7hf-debian-qemu/bin /usr/bin

# RUN [ "cross-build-start" ]

RUN wget -O - -q https://archive.raspberrypi.org/debian/raspberrypi.gpg.key | apt-key add -
RUN echo "deb http://archive.raspberrypi.org/debian jessie main" | tee --append /etc/apt/sources.list
RUN apt-get update && apt-get install -y wiringpi

RUN npm config set unsafe-perm true
RUN npm install -g pm2

ADD package.json .

RUN npm install --production
RUN npm cache clean --force

# RUN [ "cross-build-end" ]

ADD src src

CMD ["pm2-docker", "src/server.js"]
