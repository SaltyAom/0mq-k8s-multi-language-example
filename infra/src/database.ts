import * as gcp from '@pulumi/gcp'
import * as pulumi from '@pulumi/pulumi'

import { region as defaultRegion, database as databaseConfig } from '../config'

import type { DependsOn } from './types'

const createDatabase = (
	name: string,
	{
		region = defaultRegion,
		tier = 'db-custom-4-4096',
		network,
		dependsOn
	}: {
		region?: string
		tier?: string
		network: pulumi.Input<string>
		dependsOn: DependsOn
	}
) => {
	const instance = new gcp.sql.DatabaseInstance(
		name,
		{
			region,
			databaseVersion: 'POSTGRES_13',
			deletionProtection: true,
			settings: {
				tier,
				availabilityType: 'REGIONAL',
				diskAutoresize: true,
				diskType: 'PD_SSD',
				diskSize: 20,
				backupConfiguration: {
					backupRetentionSettings: {
						retainedBackups: 7
					},
					location: region
				},
				ipConfiguration: {
					ipv4Enabled: true,
					privateNetwork: network
				},
				insightsConfig: {
					queryInsightsEnabled: true,
					recordApplicationTags: true,
					recordClientAddress: false
				}
			}
		},
		{
			dependsOn
		}
	)

	const database = new gcp.sql.Database(`${name}-database`, {
		instance: instance.name
	})

	const databaseUser = new gcp.sql.User(databaseConfig.username, {
		name: databaseConfig.username,
		instance: instance.name,
		password: databaseConfig.password
	})

	return {
		database,
		instance,
		databaseUser
	}
}

export default createDatabase
