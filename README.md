# Nginx Docker Deployment

## Description

Manage multiple docker applications using nginx reverse proxy in one server.

## Set up a fake server

```bash
docker build -t fake-server .
docker run --privileged -it --name fake-server -p 80:80 -p 443:443 -d fake-server
```

An example node microservice and nginx config are copied to `/opt` in the container.

## Create nginx and microservices

1. Shell into fake server

```bash
docker exec -it fake-server bash
```

**NOTE:** The command in fake server are prefixed `$` for clearity.

2. Start docker

```bash
$ service docker start
```

3. Start nginx

```bash
$ docker run -it --name nginx -p 80:80 -d \
    -v /opt/nginx/conf.d:/etc/nginx/conf.d \
    nginx:alpine
```

The nginx configs are mounted at `/opt/nginx/conf.d`

**NOTE:** Nginx fails now since there is no `status` upstream.

4. Build and start the status microservice

```bash
$ docker build -t status /opt/microservices/status
$ docker run --name status -d status
```

5. Connect nginx and status microservice

```bash
$ docker network create nginx_status
$ docker network connect nginx_status nginx
$ docker network connect nginx_status status
```

6. Restart nginx

```bash
$ docker restart nginx
```

## Test

Ping the fake server outside the container

```bash
./ping.sh "fake-server"
./ping.sh "status.fake-server"
```

It does not work when using a browser since the fake server is hosted locally.
But you can add lines to `/etc/hosts` to tell browser `fake-server` is in local.

```
127.0.0.1	fake-server
127.0.0.1	status.fake-server
```

## Create self signed certificate

1. Create SSL certficate

```bash
$ openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/ssl/private/fake-server.key \
    -out /etc/ssl/certs/fake-server.crt
```

2. Create the self signed nginx

```bash
$ docker rm nginx -f
$ docker run -it --name nginx -p 80:80 -p 443:443 -d \
    --network nginx_status \
    -v /opt/self-signed-nginx/conf.d:/etc/nginx/conf.d \
    -v /etc/ssl/certs/fake-server.crt:/etc/ssl/certs/fake-server.crt \
    -v /etc/ssl/private/fake-server.key:/etc/ssl/private/fake-server.key \
    nginx:alpine
```

Now all the http requests will be redirect to https.
To create a verified certificate, see [nginx-certbot](https://github.com/senhungwong/nginx-certbot).
