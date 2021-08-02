# 0mq k8s example
Example of using 0mq inside K8S environment with multi-language communication.

## Diagram
   Golang <----- 0mq -----> Node.js
(Web Server)  (bridge)  (Database Engine)

## Prerequisted
- Docker
- k8s

## How to
0. [Install Ingress NGINX (Community Edition)](https://kubernetes.github.io/ingress-nginx/deploy/) `ingress-nginx` if you haven't.

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

##### Note: The template is not the best practice, you can improve it much better but I the idea is to prove that this work and I want to reduce any complexity where possible as state above.

##### Note: For some reason, you might have to run deployment command 2-3 times to make it complete for some reason.

## What this do
1 Command automate deployment to GCP.
Including:
- Create VPC Network, subnetwork and private network service for internal service communication.
- PostgreSQL with users.
- Create Autopilot Kubernetes Engine and deploys the images.
   - Deploy pod with replicas and load balancer service.
   - Install nginx helm chart and use ingress to direct traffic.

## Prerequisted
- [Pulumi](http://pulumi.com)

Manaul:
1. Push docker image of `fiber` and `database-engine` to any registry.

2. Rename `config.ts` to `.ts` and fill the form.
- Rename `src/config.example.ts` to `config.ts`.
- Rename `src/config.example.ts` to `config.ts`.

3. Config deployment zone and project id
```bash
pulumi config set gcp:project <Your GCP project ID>
pulumi config set gcp:zone asia-southeast1-a
```

4. Run:
```bash
cd infra && yarn up
```

## Note
You might see `PublicIp` if deployment succeed, that's the `Load Balaner` service not the `Ingress`.
If you want `Ingress` IP, you can find one in GCP Console.

<img src="https://user-images.githubusercontent.com/35027979/124180626-a6be0d00-dade-11eb-89aa-e7d5ff39ba69.gif" alt="Enterprise" width=48 />
