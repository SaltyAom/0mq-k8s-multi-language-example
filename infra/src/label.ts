import { clusterName } from '../config'

const createLabel = (name: string) =>
	[
		name,
		{
			appClass: clusterName,
			app: name
		}
	] as const

export default createLabel
