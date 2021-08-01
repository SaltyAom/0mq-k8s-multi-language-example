import * as k8s from '@pulumi/kubernetes'
import * as pulumi from '@pulumi/pulumi'

const createDeployment = (
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
		spec: pulumi.Input<k8s.types.input.apps.v1.DeploymentSpec>
	}
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
		name: deploymentName
	}
}

export default createDeployment
