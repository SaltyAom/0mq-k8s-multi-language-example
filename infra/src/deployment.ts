import * as k8s from '@pulumi/kubernetes'

import type { AppDeployment } from './types'

const createDeployment = (
	name: string,
	{
		clusterProvider,
		namespace,
		label,
		spec
	}: AppDeployment
) => {
	const deployment = new k8s.apps.v1.Deployment(
		name,
		{
			metadata: {
				namespace,
				labels: label
			},
			spec
		},
		{
			provider: clusterProvider
		}
	)

	const deploymentName = deployment.metadata.apply((m) => m.name)

	return {
		name: deploymentName,
		deployment
	}
}

export default createDeployment
