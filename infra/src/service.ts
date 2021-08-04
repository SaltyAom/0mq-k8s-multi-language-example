import * as k8s from '@pulumi/kubernetes'

import type { AppService } from './types'

const createService = (
	name: string,
	{
		clusterProvider,
		namespace,
		label,
		spec
	}: AppService
) => {
	const service = new k8s.core.v1.Service(
		name,
		{
			metadata: {
				labels: label,
				namespace,
				annotations: { 'cloud.google.com/neg': '{"ingress": true}' }
			},
			spec
		},
		{
			provider: clusterProvider
		}
	)

	const serviceName = service.metadata.apply((m) => m.name)

	return {
		name: serviceName,
		service
	}
}

export default createService
