#!/bin/bash

source ./config.sh

apt install docker docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
docker pull node
${docker_run} npm install
