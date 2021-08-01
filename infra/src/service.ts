import * as k8s from '@pulumi/kubernetes'
import * as pulumi from '@pulumi/pulumi'

const createService = (
	name: string,
	{
		clusterProvider,
		namespace,
		label,
		spec
	}: {
		clusterProvider: k8s.Provider
		namespace: pulumi.Output<string>
		label: pulumi.Input<{
			[key: string]: pulumi.Input<string>
		}>
		spec: pulumi.Input<k8s.types.input.core.v1.ServiceSpec>
	}
) => {
	const service = new k8s.core.v1.Service(
		name,
		{
			metadata: {
				labels: label,
				namespace
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
