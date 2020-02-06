NAME=kore-ui
AUTHOR ?= appvia
REGISTRY=quay.io
VERSION ?= latest

default: build

build:
	@echo "--> Building"
	npm run build

docker-release:
	@echo "--> Building a release image"
	@$(MAKE) docker
	@docker push ${REGISTRY}/${AUTHOR}/${NAME}:${VERSION}

docker:
	@echo "--> Building the docker image"
	docker build -t ${REGISTRY}/${AUTHOR}/${NAME}:${VERSION} .

compose:
	@echo "--> Pulling images"
	@docker-compose pull
	@echo "--> Starting dependencies"
	@docker-compose up -d

compose-down:
	@echo "--> Stopping dependencies"
	@docker-compose down

compose-logs:
	@echo "--> Stopping dependencies"
	@docker-compose logs -f
