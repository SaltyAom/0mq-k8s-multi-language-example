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

### Pre deployment
1. Push docker image of `fiber` and `database-engine` to any registry.
- Make sure Google Cloud can access the registry.
- The easiest way is to host it in Google Cloud Image Registry, so the image is private, GCP can access it.

2. Rename `config.ts` to `.ts` and fill the form.
- Rename `src/config.example.ts` to `config.ts`.
- Rename `src/config.example.ts` to `config.ts`.

3. Config deployment zone and project id
```bash
pulumi config set gcp:project <Your GCP project ID>
pulumi config set gcp:zone asia-southeast1-a
```

### Deployment
Run:
```bash
cd infra && yarn up
```

The deployment will take a couple minute before complete.
Once complete, you will be able to access the deployment.

### Post deployment
If you access any endpoint the use `database-engine`, you will notice that it will return `success: false` response.
Because the automation doesn't create Database schema, you have to created one yourself.

1. Go to your SQL deployment on GCP.
- Go the `GCP console` 
- Select `SQL` from sidebar 
- Select `<your deployed database>`

2. Grab the IP address into local `database-engine/.env`.
```env
DATABASE_URL="postgresql://<username>:<password>@<Cloud SQL IP Adress>/prismaQueue?schema=queue"
```

3. Enable Cloud SQL local machine access.
- Select `Edit` in GCP SQL console page 
- Scroll down and expand `Connections` 
- Check `Enable Public IP` if not enabled 
- Under `Authorized Networks`, click `Add Network`
- Name your network and add your current `IP Address` ([Check your ip here](https://www.google.com/search?q=my+ip&oq=my+ip))

4. Migrate schema and table from your Prisma defination to Cloud SQL.
- Go to `database-engine`
```bash
cd database-engine
```
- Run `npx prisma migrate <stack name>` (This repo's default is `dev`)
```bash
npx prisma migrate <stack name>
```

After following Post Deployment process, the Database Engine should be able to query and everything should be working just fine.

## Note
If you want `Ingress` IP, you can find one in GCP Console.

<img src="https://user-images.githubusercontent.com/35027979/124180626-a6be0d00-dade-11eb-89aa-e7d5ff39ba69.gif" alt="Enterprise" width=48 />
