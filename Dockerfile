FROM node:22-bullseye-slim AS base

WORKDIR /usr/src/app

ENV YARN_DISABLE_GIT_HOOKS=1
ENV CI=true
ENV FORCE_COLOR=true

RUN apt-get update && \
    apt-get upgrade -y --no-install-recommends && \
    apt-get install -y --no-install-recommends build-essential dumb-init python3 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get autoremove

COPY --chown=node:node yarn.lock .
COPY --chown=node:node package.json .
COPY --chown=node:node .yarnrc.yml .
COPY --chown=node:node .yarn/ .yarn/

ENTRYPOINT ["dumb-init", "--"]

FROM base AS builder

ENV NODE_ENV="development"

COPY --chown=node:node tsconfig.base.json tsconfig.base.json
COPY --chown=node:node tsup.config.ts .
COPY --chown=node:node prisma/ prisma/
COPY --chown=node:node src/ src/

RUN yarn install --immutable \
    && yarn run prisma:generate \
    && yarn run build

FROM base AS runner

ENV NODE_ENV="production"
ENV NODE_OPTIONS="--enable-source-maps"
ENV TZ="Europe/London"

COPY --chown=node:node .env .env
COPY --chown=node:node --from=builder /usr/src/app/dist dist
COPY --chown=node:node --from=builder /usr/src/app/src/locales src/locales

RUN yarn workspaces focus --all --production

# Patch .prisma with the built files
COPY --chown=node:node --from=builder /usr/src/app/node_modules/.prisma node_modules/.prisma

RUN chown node:node /usr/src/app/

USER node

CMD [ "yarn", "run", "start" ]
