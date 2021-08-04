import * as k8s from '@pulumi/kubernetes'

import type { AppIngress } from './types'

const createIngress = (
	name: string,
	{ clusterProvider, namespace, label, paths, dependsOn }: AppIngress
) => {
	const nginx = new k8s.helm.v3.Chart(
		'nginx',
		{
			namespace,
			chart: 'ingress-nginx',
			version: '3.34.0',
			repo: 'ingress-nginx',
			fetchOpts: {
				repo: 'https://kubernetes.github.io/ingress-nginx'
			},
			values: { controller: { publishService: { enabled: true } } },
			transformations: [
				(obj) => {
					if (obj.metadata) obj.metadata.namespace = namespace
				}
			]
		},
		{ provider: clusterProvider, dependsOn }
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
		{ provider: clusterProvider, dependsOn }
	)
}

export default createIngress
