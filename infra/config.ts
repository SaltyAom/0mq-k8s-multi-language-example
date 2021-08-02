import { databasePassword } from './src/secret'

export const clusterName = 'saltyaom-san-diego-kube'

export const vpcNetworkName = 'saltyaom-san-diego-network'
export const vpcNetworkDescription = "Internal Network for SaltyAom's San Diego"

export const region = 'asia-southeast1'

export const database = {
	name: 'saltyaom-san-diego-postgres',
	username: 'saltyaom',
	password: databasePassword,
	table: 'prismaQueue',
	schema: 'queue'
}
