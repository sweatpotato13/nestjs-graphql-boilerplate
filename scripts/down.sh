#!/bin/sh

export DIR_DATA_PATH="$PWD"

export CONTAINER_COMMAND="yarn start:prod"
export CONTAINER_SCALE="1"

docker-compose -f docker-compose-dev.yml down -v
