# 4WEBD

This project is composed of multiples services : 
- Mailer
- RabbitMQ
- FastAPI
- React
- PostgreSQL

In order to start the differents applications from a production point of view. Please take a look at the README.md from the k8s folder :)

Also, it is possible to run all services from docker in a developement environement : ```docker compose up --build -d```

All images are visible from [Docker registry](https://hub.docker.com/u/gabrielti)

Please note that you need to create .env from the .env-example with the correct values (that are already put in there hum hum)