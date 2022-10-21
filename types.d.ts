// Type definitions for DataTables AutoFill
//
// Project: https://datatables.net/extensions/autofill/, https://datatables.net
// Definitions by:
//   SpryMedia
//   Andy Ma <https://github.com/andy-maca>

/// <reference types="jquery" />

import DataTables, {Api} from 'datatables.net';

export default DataTables;

declare module 'datatables.net' {
	interface Config {
		/**
		 * autoFill extension options
		 */
		autoFill?: boolean | ConfigAutoFill;
	}

	interface Api<T> {
		/**
		 * Initialise AutoFill on the DataTable
		 * 
		 * @returns Api for chaining with the additional autoFill methods
		 */
		autoFill: ApiAutoFill<T>;
	}
}

interface ConfigAutoFill {
	/**
	 * Always ask the end user if an action should be taken or not
	 */
	alwaysAsk?: boolean;

	/**
	 * Select the columns that can be auto filled
	 */
	columns?: string | number[];

	/**
	 *
	 * Initial enablement state of AutoFill
	 */
	enable?: boolean;
}

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
