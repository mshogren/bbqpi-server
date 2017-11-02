FROM arm32v7/node:latest

WORKDIR /app

ENV NODE_ENV=production \
  NPM_CONFIG_PREFIX=/home/node/.npm-global \
  PATH="${PATH}:/home/node/.npm-global/bin"

RUN groupmod -g 999 node && usermod -u 999 -g 999 node

RUN wget -O - -q https://archive.raspberrypi.org/debian/raspberrypi.gpg.key | apt-key add - \
  && echo "deb http://archive.raspberrypi.org/debian jessie main" | tee --append /etc/apt/sources.list \
  && apt-get update \
  && apt-get install -y wiringpi \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

ADD package.json .

RUN npm config set unsafe-perm true \
  && npm install -g pm2 \
  && npm install --production \
  && npm cache clean --force

ADD src src

USER node

CMD ["pm2-docker", "src/server.js"]
