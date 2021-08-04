import * as k8s from '@pulumi/kubernetes'
import * as pulumi from '@pulumi/pulumi'
import * as gcp from '@pulumi/gcp'

import { clusterName as name, region } from '../config'

const createCluster = (network: pulumi.Output<string>) => {
	const cluster = new gcp.container.Cluster(name, {
		initialNodeCount: 1,
		releaseChannel: {
			channel: 'REGULAR'
		},
		location: region,
		networkingMode: 'VPC_NATIVE',
		enableAutopilot: true,
		network,
		// Is required for some weird reason
		ipAllocationPolicy: {
			clusterIpv4CidrBlock: '',
			servicesIpv4CidrBlock: ''
		},
		enableL4IlbSubsetting: true,
		addonsConfig: {
			dnsCacheConfig: {
				enabled: true
			},
			horizontalPodAutoscaling: {
				disabled: false
			}
		},
		nodeConfig: {
			machineType: 'n1-highcpu-4',
			oauthScopes: [
				'https://www.googleapis.com/auth/compute',
				'https://www.googleapis.com/auth/devstorage.read_only',
				'https://www.googleapis.com/auth/logging.write',
				'https://www.googleapis.com/auth/monitoring',
				'https://www.googleapis.com/auth/cloud-platform'
			]
		}
	})

	// Export the Cluster name
	const clusterName = cluster.name

	// Manufacture a GKE-style kubeconfig. Note that this is slightly "different"
	// because of the way GKE requires gcloud to be in the picture for cluster
	// authentication (rather than using the client cert/key directly).
	const kubeconfig = pulumi
		.all([cluster.name, cluster.endpoint, cluster.masterAuth])
		.apply(([name, endpoint, masterAuth]) => {
			const context = `${gcp.config.project}_${gcp.config.zone}_${name}`

			return `apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: ${masterAuth.clusterCaCertificate}
    server: https://${endpoint}
  name: ${context}
contexts:
- context:
    cluster: ${context}
    user: ${context}
  name: ${context}
current-context: ${context}
kind: Config
preferences: {}
users:
- name: ${context}
  user:
    auth-provider:
      config:
        cmd-args: config config-helper --format=json
        cmd-path: gcloud
        expiry-key: '{.credential.token_expiry}'
        token-key: '{.credential.access_token}'
      name: gcp
`
		})

	// Create a Kubernetes provider instance that uses our cluster from above.
	const clusterProvider = new k8s.Provider(name, {
		kubeconfig: kubeconfig
	})

	// Create a Kubernetes Namespace
	const ns = new k8s.core.v1.Namespace(
		name,
		{},
		{ provider: clusterProvider }
	)

	const namespaceName = ns.metadata.apply((m) => m.name)

	return {
		name: clusterName,
		provider: clusterProvider,
		namespace: namespaceName
	}
}

export default createCluster
