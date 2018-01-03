.PHONY: all

all:
	mkdir -p build/server
	cd client && yarn build
	cd server && tsc
	cp -r server/node_modules build/server/
	cp -r server/dist build/server/src
	cp -r client/dist build/server/static
