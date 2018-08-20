#!/bin/bash

if [ $# != 3 ]; then
    echo "Args wrong"
    echo "Example: "
    echo "./single.sh [projectName] [version] [remoteIp]"
    exit 1
fi

projectName=$1
version=$2
remoteIp=$3

echo "Begin deploying [ ${projectName} ], version [ ${version} ]"

SCRIPTS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="${SCRIPTS_DIR}/../build/"

REMOTE_DIR="/data/http/${projectName}"
REMOTE_IP=${remoteIp}
REMOTE_USER="root"

ssh ${REMOTE_USER}@${REMOTE_IP} bash -s <<EOI
mkdir -p  ${REMOTE_DIR}
EOI

rsync -avz --delete --exclude upload ${PROJECT_DIR}/${version}/ ${REMOTE_USER}@${REMOTE_IP}:${REMOTE_DIR}

echo "Success deploying [ ${projectName} ] to remote dir ${REMOTE_DIR}"
