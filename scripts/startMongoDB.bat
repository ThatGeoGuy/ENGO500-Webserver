@ECHO OFF
rmdir mongo
mkdir mongo
mongod --dbpath mongo/ --port 29999
