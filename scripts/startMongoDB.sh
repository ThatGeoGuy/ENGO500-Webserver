#!/bin/bash
rm -r mongo/
mkdir mongo/
mongod --dbpath mongo/ --port 29999
