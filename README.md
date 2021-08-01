# 0mq k8s example
Example of using 0mq inside K8S environment with multi-language communication.

## Diagram
   Golang <----- 0mq -----> Node.js
(Web Server)  (bridge)  (Database Engine)

## Prerequisted
Assuming you have Docker and k8s basic.

- Docker
- k8s
- nginx ingress

## How to
1. Build Go web server in `fiber`
```bash
cd fiber
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
# Find the ingress name
kubectl get pod | grep ingress-nginx-controller-

# Copy ingress name from above to here
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

# Automated Deploy to Google Cloud
Even with automation, manual setup is still required and is complicated.
So I think I will implement basic deployment which can be automated.

## Prerequisted
- [Pulumi](http://pulumi.com)

Manaul:
1. Push docker image of `fiber` and `database-engine` to any registry.

2. Edit `k8s/index.ts`, add your image registry.

3. Add `DATABASE_URL` env in `k8s/index.ts`.

4. Run:
```bash
cd infra && yarn up
```

<img src="https://user-images.githubusercontent.com/35027979/124180626-a6be0d00-dade-11eb-89aa-e7d5ff39ba69.gif" alt="Enterprise" width=48 />
