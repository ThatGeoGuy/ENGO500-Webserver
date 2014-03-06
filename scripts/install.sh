TARFILE=$(find ./ -type f | grep "tgz")
tar zxvf $TARFILE -C scripts/ 
mkdir scripts/mongodb/
mv scripts/mongodb-linux-*/* scripts/mongodb/
rm -r scripts/mongodb-linux*
DIR=$(realpath "$(pwd)/scripts/mongodb/bin/")
PATH=$PATH:$DIR
export PATH
