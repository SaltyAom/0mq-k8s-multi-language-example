# 0mq k8s example
Example of using 0mq inside K8S environment with multi-language communication.

## Diagram
   Golang <----- 0mq -----> Node.js
(Web Server)  (bridge)  (Database Engine)

## Prerequisted
I assume that you already have Docker and k8s basic.
- Docker
- k8s
- nginx ingress

## How to
1. Build Go web server at root
```bash
docker build -t docker -t fiber-prisma-main .
```

2. Build Node.js Database Engine in `database-engine`
```bash
cd database-engine
docker build -t fiber-prisma-db-engine .
```

3. Verify if all Docker build pass.

4. Port forward nginx Ingress if you haven't.
   (I'm going to forward to localhost:8080)
```bash
# This is going to return ingress name
kubectl get pod | grep ingress-nginx-controller-

# Copy ingress name from above
kubectl port-forward ingress-nginx-controller-[hash]-[hash] 8080:80
```

5. Run service
```bash
# At project root
./up.sh
```

6. To stop service, simply run
```bash
./down.sh
```


<img src="https://user-images.githubusercontent.com/35027979/124180626-a6be0d00-dade-11eb-89aa-e7d5ff39ba69.gif" alt="Enterprise" width=48 />
