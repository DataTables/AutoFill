// Type definitions for DataTables AutoFill

import DataTables, { Api } from 'datatables.net';
import AutoFill from '../js/AutoFill';
import { Defaults } from '../js/interface';

export default DataTables;
export * from 'datatables.net';

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * DataTables' types integration
 */
declare module 'datatables.net' {
	interface Config {
		/**
		 * autoFill extension options
		 */
		autoFill?: boolean | Partial<Defaults>;
	}

	interface ConfigLanguage {
		/**
		 * AutoFill language options
		 */
		autoFill?: ConfigAutoFillLanguage;
	}

	interface Api<T> {
		/**
		 * AutoFill methods container
		 *
		 * @returns Api for chaining with the additional autoFill methods
		 */
		autoFill: ApiAutoFill<T>;
	}

	interface DataTablesStatic {
		/**
		 * AutoFill class
		 */
		AutoFill: AutoFill;
	}
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Options
 */

interface ConfigAutoFillLanguage {
	/**
	 * Multi-fill selector button text
	 */
	button?: string;

	/**
	 * Multi-fill selector cancel option message
	 */
	cancel?: string;

	/**
	 * Multi-fill selector message for the _full fill_ fill type
	 */
	fill?: string;

	/**
	 * Multi-fill selector message for the _horizontal fill_ fill type
	 */
	fillHorizontal?: string;

	/**
	 * Multi-fill selector message for the _vertical fill_ fill type
	 */
	fillVertical?: string;

	/**
	 * Multi-fill selector message for the _increment_ fill type
	 */
	increment?: string;

	/**
	 * Information message shown at the top of the fill type selector
	 */
	info?: string;
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * API
 */

interface ApiAutoFill<T> {
	(): ApiAutoFillMethods<T>;
}

interface ApiAutoFillMethods<T> extends Api<T> {
	/**
	 * Disable AutoFill. Please note that this disallows future interactions with the table (until re-enabled).
	 *
	 * @returns DataTables Api instance
	 */
	disable(): Api<T>;

	/**
	 * Enable end user and API modification of the focused cells in the DataTable. Differing levels of enablement are available via the optional parameter.
	 *
	 * @param flag can be true or false to signify whether to enable or disable
	 * @returns DataTables Api instance
	 */
	enable(flag?: string | boolean): Api<T>;

	/**
	 * This method will return a boolean value indicating if AutoFill is enabled or not on the selected table.
	 *
	 * @returns boolean signifying if autofill is enables
	 */
	enabled(): boolean;
}
