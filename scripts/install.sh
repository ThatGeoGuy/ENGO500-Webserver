#!/bin/bash
TARFILE=$(find ./ -type f | grep "tgz")
tar zxvf $TARFILE -C scripts/ 
mkdir scripts/mongodb/
mv scripts/mongodb-linux-*/* $HOME/.mongodb/
rm -r scripts/mongodb-linux*
DIR=$HOME/.mongodb/bin/
export PATH=$PATH:$DIR
