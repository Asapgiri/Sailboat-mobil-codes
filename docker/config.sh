#!/bin/bash

docker_config="--mount type=bind,source="$(pwd)"/..,target=/app"
image="node-ws"
docker_run="docker run ${docker_config} ${image}"
