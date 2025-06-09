#!/bin/bash 
echo "Hello World!"

function do_exit() {
  echo "Exiting ..."
  echo "Done."
}
trap do_exit SIGTERM SIGINT SIGHUP

npm run preview &

./node_modules/.bin/nodemon --ext ts --watch src --exec 'vite-node ./src/main.ts' &

sleep infinity &
wait $!
