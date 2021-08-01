import { clusterName } from '../config'

const createLabel = (name: string) =>
	[
		name,
		{
			appClass: clusterName
		}
	] as const

export default createLabel
