.PHONY: build clean deploy

build:
	export GO111MODULE=on
	env GOARCH=amd64 GOOS=linux go build -ldflags="-s -w" -o bin/page-load page-load/main.go
	env GOARCH=amd64 GOOS=linux go build -ldflags="-s -w" -o bin/cors cors/main.go

clean:
	rm -rf ./bin ./vendor go.sum

deploy: clean build
	sls deploy --verbose

