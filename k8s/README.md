
<h2>Starts the projet : </h2>

1 - Install OrbStack (https://orbstack.dev/) or Init Kubernetes from Docker Desktop

2 - Install helm : ```brew install helm```

3 - Go to project root (not in /app)

4 - Create a namespace : ```kubectl create namespace app```

5 - Run the project : ```helm upgrade --install app ./app -n app```

Once it's done, you can find your front-end from the pods IP (shown it orb stack or ```kubectl get services -n app``` and then look for app-front)

You can also find the API, which has a swagger at ({$fastapi}:8000/docs).

7 - Delete the pods from its namespace : ```kubectl delete deployments,statefulsets,daemonsets --all -n app```

```FOR DEVELEPEMENT ONLY```

In order to publish images into the differents registries :
- Mailer :
- ```docker build -t gabrielti/4webdmailer:latest --build-arg RABBITMQ_URL=amqp://guest:guest@app-rabbitmq.app.svc.cluster.local:5672/ .```
- ```docker push gabrielti/4webdmailer:latest  ```

- React :
- ```docker build -t gabrielti/4webdfront:latest --build-arg REACT_APP_API_URL=http://127.0.0.1:30001 . ```
- ```docker push gabrielti/4webdfront:latest  ```

Note : All images are build from the pipeline. These commands are only if needed in specific cases.

