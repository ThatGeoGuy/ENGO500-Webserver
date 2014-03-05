TARFILE=$(find ./ -type f | grep "tgz")
tar zxvf $TARFILE -C scripts/ 
mkdir scripts/mongodb-linux/
mv scripts/mongodb-linux-*/* scripts/mongodb-linux/
rm -r scripts/mongodb-linux-x*
DIR=$(realpath "$(pwd)/scripts/mongodb-linux/bin/")
PATH=$PATH:DIR
export PATH
