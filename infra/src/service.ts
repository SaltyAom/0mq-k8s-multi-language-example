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
	const servicePublicIP = service.status.apply(
		(s) => s.loadBalancer.ingress[0].ip
	)

	return {
		name: serviceName,
		publicIp: servicePublicIP
	}
}

export default createService
