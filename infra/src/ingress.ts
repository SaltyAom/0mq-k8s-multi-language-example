import * as pulumi from '@pulumi/pulumi'
import * as k8s from '@pulumi/kubernetes'

import type { AppIngress } from './types'

const createIngress = (
	name: string,
	{ clusterProvider, namespace, label, paths }: AppIngress
) => {
	const nginx = new k8s.helm.v3.Chart(
		'nginx',
		{
			namespace,
			chart: 'nginx-ingress',
			version: '1.41.3',
			fetchOpts: {
				repo: 'https://charts.helm.sh/stable'
			},
			values: { controller: { publishService: { enabled: true } } },
			transformations: [
				(obj) => {
					if (obj.metadata) obj.metadata.namespace = namespace
				}
			]
		},
		{ provider: clusterProvider }
	)

	const ingress = new k8s.networking.v1.Ingress(
		name,
		{
			metadata: {
				labels: label,
				namespace,
				annotations: { 'kubernetes.io/ingress.class': 'nginx' }
			},
			spec: {
				rules: [
					{
						http: {
							paths
						}
					}
				]
			}
		},
		{ provider: clusterProvider }
	)
}

export default createIngress
