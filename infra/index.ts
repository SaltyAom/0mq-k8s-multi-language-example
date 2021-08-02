import * as pulumi from '@pulumi/pulumi'
import {
	createCluster,
	createDeployment,
	createDatabase,
	createLabel,
	createIngress,
	createService,
	createVPC
} from './src'

import { clusterName as name, database } from './config'
import { webServer, databaseEngine } from './src/secret'

const { network, selfLink } = createVPC()

const { name: clusterName, provider, namespace } = createCluster(network)

export const ClusterName = clusterName

const { instance } = createDatabase(database.name, {
	tier: 'db-custom-4-4096',
	network: selfLink
})

const { publicIpAddress, privateIpAddress } = instance

export const DatabasePublicIpAddress = publicIpAddress

const [main, mainLabel] = createLabel('saltyaom-san-diego-fiber')

const { name: deploymentName } = createDeployment(main, {
	clusterProvider: provider,
	namespace,
	label: mainLabel,
	spec: {
		replicas: 1,
		selector: {
			matchLabels: mainLabel
		},
		template: {
			metadata: {
				labels: mainLabel
			},
			spec: {
				containers: [
					{
						name: 'fiber',
						image: webServer,
						ports: [
							{
								name: 'http',
								containerPort: 3000
							}
						],
						resources: {
							requests: {
								memory: '512Mi',
								cpu: '1m'
							},
							limits: {
								memory: '3Gi',
								cpu: '3m'
							}
						}
					},
					{
						name: 'database-engine',
						image: databaseEngine,
						env: [
							{
								name: 'DATABASE_URL',
								value: pulumi
									.all([privateIpAddress])
									.apply(
										([privateIpAddress]) =>
											`postgresql://${database.username}:${database.password}@${privateIpAddress}/${database.table}?schema=${database.schema}`
									)
							}
						],
						resources: {
							requests: {
								memory: '1Gi',
								cpu: '0.5m'
							},
							limits: {
								memory: '4Gi',
								cpu: '2m'
							}
						}
					}
				]
			}
		}
	}
})

export const DeploymentName = deploymentName

const [mainService, mainServiceLabel] = createLabel('main-service')
const { name: serviceName, publicIp } = createService(mainService, {
	clusterProvider: provider,
	namespace,
	label: mainServiceLabel,
	spec: {
		type: 'LoadBalancer',
		selector: mainServiceLabel,
		internalTrafficPolicy: 'Local',
		ports: [
			{
				port: 80,
				targetPort: 3000
			}
		]
	}
})

export const ServiceName = serviceName
export const PublicIp = publicIp

const [ingressName, ingressLabel] = createLabel(`${name}-ingress`)
createIngress(ingressName, {
	label: ingressLabel,
	namespace,
	clusterProvider: provider,
	paths: [
		{
			path: '/',
			pathType: 'Prefix',
			backend: {
				service: {
					name: serviceName,
					port: {
						number: 80
					}
				}
			}
		}
	]
})
