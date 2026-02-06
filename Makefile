PROJECT_ID=escrow-app-project
IMAGE_NAME=gcr.io/$(PROJECT_ID)/escrow-app-project
REGION=us-central1
SERVICE_NAME=escrow-app-web

.PHONY: build push deploy down all

build:
	docker buildx build --platform linux/amd64 --load -t $(IMAGE_NAME) .

push:
	docker push $(IMAGE_NAME)

deploy:
	gcloud config set project $(PROJECT_ID)
	gcloud run deploy $(SERVICE_NAME) \
		--image $(IMAGE_NAME) \
		--platform managed \
		--region $(REGION) \
		--allow-unauthenticated

down:
	gcloud config set project $(PROJECT_ID)
	gcloud run services delete $(SERVICE_NAME) \
		--region $(REGION) \
		--platform managed

all: build push deploy
	gcloud config set project $(PROJECT_ID)
