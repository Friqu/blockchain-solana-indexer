# DEVELOPMENT
FROM node:18 As development

ARG NPM_TOKEN
ARG NPM_REGISTRY

RUN npm install -g pnpm
RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY package.json /usr/src/app/
COPY pnpm-lock.yaml /usr/src/app/
RUN pnpm install

COPY src /usr/src/app/src
COPY test /usr/src/app/test
COPY tsconfig.json /usr/src/app
COPY tsconfig.build.json /usr/src/app
COPY .eslintrc.js /usr/src/app
COPY .prettierrc /usr/src/app

RUN pnpm run build

CMD ["pnpm", "run", "start:prod"]

# PRODUCTION
FROM node:18-alpine AS production

WORKDIR /usr/src/app

COPY --chown=node:node --from=development /usr/src/app/dist ./dist
COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=development /usr/src/app/package.json ./package.json
COPY --chown=node:node --from=development /usr/local/lib/node_modules/pnpm ./pnpm
COPY --chown=node:node --from=development /usr/src/app/tsconfig.build.json ./tsconfig.build.json

CMD ["pnpm", "run", "start:prod"]
