import {
	createCluster,
	createDeployment,
	createService,
	createLabel
} from './src'

const { name: clusterName, provider, namespace } = createCluster()

export const ClusterName = clusterName

const [main, mainLabel] = createLabel('saltyaom-san-diego-fiber')

const { name: deploymentName } = createDeployment(main, {
	clusterProvider: provider,
	namespace,
	label: mainLabel,
	spec: {
		replicas: 3,
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
						image: '<"Fiber" Docker Registry>',
						ports: [
							{
								name: 'http',
								containerPort: 3000
							}
						],
						resources: {
							requests: {
								memory: '256Mi',
								cpu: '2m'
							},
							limits: {
								memory: '4Gi',
								cpu: '6m'
							}
						}
					},
					{
						name: 'database-engine',
						image: '<Database Engine Docker Registry>',
						env: [
							{
								name: 'DATABASE_URL',
								value: '<Your Database URL>'
							}
						],
						resources: {
							requests: {
								memory: '1Gi',
								cpu: '1m'
							},
							limits: {
								memory: '4Gi',
								cpu: '4m'
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
