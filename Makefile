PROJECT_ID=escrow-app-project
IMAGE_NAME=gcr.io/$(PROJECT_ID)/escrow-app-project
REGION=us-central1
SERVICE_NAME=escrow-app-web

build:
	docker buildx build --platform linux/amd64 -t $(IMAGE_NAME) .

push:
	docker push $(IMAGE_NAME)

deploy:
	gcloud run deploy $(SERVICE_NAME) \
		--image $(IMAGE_NAME) \
		--platform managed \
		--region $(REGION) \
		--allow-unauthenticated

down:
	gcloud run services delete $(SERVICE_NAME) \
		--region $(REGION) \
		--platform managed

all: build push deploy
