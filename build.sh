#!/bin/bash

set -e

# For debugging purpose
set -o xtrace

echo $1
cd $1

git clone --recursive https://github.com/cuberite/cuberite.git
cd cuberite
mkdir Release
cd Release
cmake -DCMAKE_BUILD_TYPE=RELEASE ..
make -j`nproc`
tar --create --gzip --file=/home/tw/Downloads/cuberite.tar.gz *
cd -
rm -rf $1
