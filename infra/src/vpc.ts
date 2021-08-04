import * as pulumi from '@pulumi/pulumi'
import * as gcp from '@pulumi/gcp'

import {
	vpcNetworkName,
	vpcNetworkDescription,
} from '../config'

const createVPC = () => {
	const vpc = new gcp.compute.Network(vpcNetworkName, {
		autoCreateSubnetworks: true,
		description: vpcNetworkDescription,
		name: vpcNetworkName,
		routingMode: 'GLOBAL'
	})

	let { name: network, selfLink } = pulumi
		.all([vpc])
		.apply(([network]) => network)

	const ipRange = `${vpcNetworkName}-ip-range`
	const vpcIPRange = new gcp.compute.GlobalAddress(ipRange, {
		name: ipRange,
		prefixLength: 16,
		addressType: 'INTERNAL',
		purpose: 'VPC_PEERING',
		network: selfLink,
	}, {
		dependsOn: vpc
	})

	const subNetworking = new gcp.servicenetworking.Connection(
		`${vpcNetworkName}-ns`,
		{
			network: vpcNetworkName,
			reservedPeeringRanges: [vpcIPRange.name],
			service: 'servicenetworking.googleapis.com'
		},
		{
			dependsOn: vpcIPRange
		}
	)

    return {
		vpc,
        network,
        selfLink,
        subNetworking
    }
}

export default createVPC
