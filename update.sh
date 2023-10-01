#!/bin/sh


rsync -avzgu --delete --exclude=src --exclude=node_modules --exclude=.git --partial -e "ssh -i /Users/aguerra/Dropbox/dutoVizNew.pem" * ubuntu@johnguerra.co:/var/www/johnguerra.co

# rsync -avzgu --delete --partial -e "ssh -i /Users/aguerra/Dropbox/tweetometro2.pem" * ubuntu@18.231.179.33:/var/www/johnguerra.co
# rsync -avzgu --delete --partial -e "ssh -i /Users/aguerra/Dropbox/tweetometro_paz.pem" * ubuntu@34.230.24.73:/var/www/johnguerra.co
