FROM node:20-alpine

# Install Python 3 first
RUN apk update && apk add --no-cache python3

# Upgrade sqlite-libs to the latest secure version (3.53.2+) from the Alpine edge repository to resolve CVE-2026-11824 and CVE-2026-11822
RUN apk add --no-cache --upgrade sqlite-libs --repository=http://dl-cdn.alpinelinux.org/alpine/edge/main

# Upgrade all other Alpine packages to ensure they are patched
RUN apk upgrade

# Upgrade npm globally to the latest version to resolve vulnerabilities in global npm dependencies
RUN npm install -g npm@latest

WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .

EXPOSE 5000
CMD ["npm", "start"]
