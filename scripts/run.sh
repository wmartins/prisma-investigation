#!/usr/bin/env bash

set -e

DIR=$(dirname $(realpath $0))

function log {
  echo "=>" $@
}

function run {
  log "Running" $1
  ${DIR}/$1
}

log "Stopping Postgres (if started)"
${DIR}/stop-postgres.sh

log "Starting Postgres"
${DIR}/start-postgres.sh

log "Preparing database"
npm run db:prepare

log "Introspecting DB and outputting it to \`schema.prisma\`"
npm run db:introspect

log "Generating prisma client"
npm run client:generate

log "Trying to execute"
npm run try
