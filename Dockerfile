FROM arm32v7/node:10-stretch

WORKDIR /app

ENV NODE_ENV=production \
  NPM_CONFIG_PREFIX=/home/node/.npm-global \
  PATH="${PATH}:/home/node/.npm-global/bin" \
  DBUS_SYSTEM_BUS_ADDRESS=unix:path=/host/run/dbus/system_bus_socket

RUN wget -O - -q https://archive.raspberrypi.org/debian/raspberrypi.gpg.key | apt-key add - \
  && echo "deb http://archive.raspberrypi.org/debian stretch main" | tee --append /etc/apt/sources.list \
  && apt-get update \
  && apt-get install -y wiringpi dnsmasq \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

RUN curl https://api.github.com/repos/resin-io/resin-wifi-connect/releases/latest -s \
  | grep -hoP 'browser_download_url": "\K.*armv7hf\.tar\.gz' \
  | xargs -n1 curl -Ls \
  | tar -xvz -C /app/

ADD package.json .

RUN npm config set unsafe-perm true \
  && npm install -g pm2 \
  && npm install --production \
  && npm cache clean --force

ADD src src

CMD ["pm2-docker", "src/server.js"]
