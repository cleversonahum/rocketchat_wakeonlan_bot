FROM node:20

RUN apt update && apt install net-tools

VOLUME [ "/usr/src/app" ]
WORKDIR "/usr/src/app"

RUN npm init -y && npm install @rocket.chat/sdk wakeonlan @network-utils/arp-lookup

CMD [ "node", "server.js" ]