import type * as k8s from '@pulumi/kubernetes'
import type * as pulumi from '@pulumi/pulumi'

export interface DeploymentReference {
	clusterProvider: k8s.Provider
	namespace: pulumi.Output<string>
	label: pulumi.Input<{
		[key: string]: pulumi.Input<string>
	}>
}

export interface AppDeployment extends DeploymentReference {
	spec: pulumi.Input<k8s.types.input.apps.v1.DeploymentSpec>
}

export interface AppService extends DeploymentReference {
	spec: pulumi.Input<k8s.types.input.core.v1.ServiceSpec>
}

export interface AppIngress extends DeploymentReference {
	paths: pulumi.Input<
		pulumi.Input<k8s.types.input.networking.v1.HTTPIngressPath>[]
	>
	dependsOn: DependsOn
}

export type DependsOn =
	| pulumi.Input<pulumi.Resource>
	| pulumi.Input<pulumi.Input<pulumi.Resource>[]>
	| undefined
