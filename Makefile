NAME=hub-ui
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

deps-start:
	@echo "--> Pulling images"
	@docker-compose \
		--file ../hub-apiserver/hack/compose/kube.yml \
		--file ../hub-apiserver/hack/compose/operators.yml \
		--file docker-compose.yml pull
	@echo "--> Starting dependencies"
	@docker-compose \
		--file ../hub-apiserver/hack/compose/kube.yml \
		--file ../hub-apiserver/hack/compose/operators.yml \
		--file docker-compose.yml up -d

deps-logs:
	@docker-compose \
		--file ../hub-apiserver/hack/compose/kube.yml \
		--file ../hub-apiserver/hack/compose/operators.yml \
		--file docker-compose.yml logs -f

deps-stop:
	@echo "--> Stopping dependencies"
	@docker-compose \
		--file ../hub-apiserver/hack/compose/kube.yml \
		--file ../hub-apiserver/hack/compose/operators.yml \
		--file docker-compose.yml down
