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
import { fiberImage, databaseEngineImage } from './src/secret'

const { network, selfLink, vpc, subNetworking } = createVPC()

const { name: clusterName, provider, namespace } = createCluster(network)

export const ClusterName = clusterName

const { instance } = createDatabase(database.name, {
	tier: 'db-custom-4-4096',
	network: selfLink,
	dependsOn: [vpc, subNetworking]
})

const { publicIpAddress, privateIpAddress } = instance

export const DatabasePublicIpAddress = publicIpAddress

const [fiber, fiberLabel] = createLabel('saltyaom-san-diego-fiber')

const { deployment: fiberDeployment } = createDeployment(fiber, {
	clusterProvider: provider,
	namespace,
	label: fiberLabel,
	spec: {
		replicas: 1,
		selector: {
			matchLabels: fiberLabel
		},
		template: {
			metadata: {
				labels: fiberLabel
			},
			spec: {
				containers: [
					{
						name: 'fiber',
						image: fiberImage,
						ports: [
							{
								name: 'http',
								containerPort: 3000
							}
						],
						resources: {
							requests: {
								memory: '1Gi',
								cpu: '1m'
							},
							limits: {
								memory: '2Gi',
								cpu: '2m'
							}
						}
					}
				]
			}
		}
	}
})

export const fiberUrn = fiberDeployment.urn

const [databaseEngine, databaseEngineLabel] = createLabel(
	'saltyaom-san-diego-database-engine'
)

const { deployment: databaseEngineDeployment } = createDeployment(
	databaseEngine,
	{
		clusterProvider: provider,
		namespace,
		label: databaseEngineLabel,
		spec: {
			replicas: 1,
			selector: {
				matchLabels: databaseEngineLabel
			},
			template: {
				metadata: {
					labels: databaseEngineLabel
				},
				spec: {
					containers: [
						{
							name: 'database-engine',
							image: databaseEngineImage,
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
									cpu: '1m'
								},
								limits: {
									memory: '2Gi',
									cpu: '2m'
								}
							}
						}
					]
				}
			}
		}
	}
)

export const databaseEngineUrn = databaseEngineDeployment.urn

const [mainService, mainServiceLabel] = createLabel('main-service')
const { name: serviceName, service } = createService(mainService, {
	clusterProvider: provider,
	namespace,
	label: mainServiceLabel,
	spec: {
		type: 'NodePort',
		selector: {
			appClass: mainServiceLabel.appClass
		},
		internalTrafficPolicy: 'Cluster',
		ports: [
			{
				port: 80,
				targetPort: 3000
			}
		]
	}
})

export const ServiceName = serviceName

const [ingressName, ingressLabel] = createLabel(`${name}-ingress`)
createIngress(ingressName, {
	label: ingressLabel,
	namespace,
	clusterProvider: provider,
	dependsOn: service,
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
