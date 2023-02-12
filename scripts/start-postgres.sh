#!/usr/bin/env bash

set -e

docker run \
    -d \
    --rm \
    --name postgres-prisma-investigation \
    -e POSTGRES_PASSWORD="password" \
    -p 5432:5432 \
    postgres:15.2-alpine
