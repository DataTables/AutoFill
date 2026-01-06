import { dts } from 'rollup-plugin-dts';

export default [
	{
		input: 'dist/dataTables.autoFill.js',
		output: {
			file: 'dist/dataTables.autoFill.js',
			format: 'es'
		},
		plugins: []
	},
	{
		// Create a single .d.ts file
		input: './types/types.d.ts',
		output: [{ file: 'dist/types.d.ts', format: 'es' }],
		plugins: [dts()]
	}
];
