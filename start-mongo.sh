docker rm -f mongo
set -e
docker run --name mongo -v mongodb_vol:/data/db -p 27017:27017 -d mongo