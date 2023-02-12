# Prisma Investigation

This repo contains related code for an ongoing investigation on an issue that
happens with `engineType = "binary"` and a big number of tables and fields.

The error that happens is a `MaxBufferError`:

```
{
  "name": "MaxBufferError",
  "originalMessage": "maxBuffer exceeded",
  "shortMessage": "Command failed: /<PATH-TO>/prisma-investigation/node_modules/.prisma/client/query-engine-darwin --enable-raw-queries cli dmmf\nmaxBuffer exceeded",
  "command": "/<PATH-TO>/prisma-investigation/node_modules/.prisma/client/query-engine-darwin --enable-raw-queries cli dmmf",
  "escapedCommand": "\"/<PATH-TO>/prisma-investigation/node_modules/.prisma/client/query-engine-darwin\" --enable-raw-queries cli dmmf",
  ...
}
```

# How to reproduce

This repo is a simple setup that helps to reproduce the issue. It also aims to
try to get a hint on what causes it. The initial suspicion is that it has
something to do with a schema that has too many tables or fields.

## Installation

`npm` should take care of installing everything you need:

```bash
npm install
```

In case you want to run the runner (`scripts/run.sh`), be aware that it uses
`docker` to set up a Postgres instance, so you'd need to have `docker` installed
as well.

## Reproducing

The [`fixture`](./fixture/) folder has some schemas that were used to test this
problem. They follow this naming strategy:

- `schema.<description>.<fails | succeeds>.prisma`

If you want to test out one that fails (for example,
`schema.99-fields.93-tables.fails.prisma`), you can do the following:

```bash
./node_modules/.bin/prisma generate --schema ./fixture/schema.99-fields.93-tables.fails.prisma

npm run try
```

This is supposed to show you the following message:

```
Failed! The output is availabe in /tmp/prisma-investigation-error.log.
Opening with VS Code may get your editor stuck

You can try opening it using `head`
The first 6 lines contain some details:
$ head -n 6 /tmp/prisma-investigation-error.log
```

The reason why the entire error log is not commited or advised to be open with VS Code is because it's a 105M file:

```text
-rw-r--r--  1 wmartins  wheel   105M Feb 13 09:23 /tmp/prisma-investigation-error.log
```

## Using the runner

While trying to understand this problem, I got myself trying different
configurations over and over, which slowed me down a lot. To improve this a
little, I decided to write a script that did everything that I was doing in one
go.

The runner is a shell script located in `scripts/run.sh`. What it does:

- Stops a previously running Postgres instance
- Starts a new Postgres instance
- Adds tables with fields to this Postgres database
  - You can specify the number of tables with `N_TABLES` env var
  - You can specify the number of fields in each table with `N_FIELDS` env var
- Introspects the database (`prisma db pull`), reading from `db.prisma` and
generating `schema.prisma`
- Tries to execute a query

For example:

``` bash
# This fails
N_FIELDS=99 N_TABLES=93 ./scripts/run.sh

# This fails
N_FIELDS=100 N_TABLES=92 ./scripts/run.sh

# This succeeds
N_FIELDS=99 N_TABLES=92 ./scripts/run.sh

# This succeeds
N_FIELDS=100 N_TABLES=91 ./scripts/run.sh
```
