// Type definitions for DataTables AutoFill
//
// Project: https://datatables.net/extensions/autofill/, https://datatables.net
// Definitions by:
//   SpryMedia
//   Andy Ma <https://github.com/andy-maca>

/// <reference types="jquery" />

import DataTables, {Api} from 'datatables.net';

export default DataTables;


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * DataTables' types integration
 */
declare module 'datatables.net' {
	interface Config {
		/**
		 * autoFill extension options
		 */
		autoFill?: boolean | ConfigAutoFill;
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

	interface ApiStatic {
		/**
		 * AutoFill class
		 */
		AutoFill: {
			/**
			 * Create a new AutoFill instance for the target DataTable
			 */
			new (dt: Api<any>, settings: boolean | ConfigAutoFill);

			/**
			 * AutoFill version
			 */
			version: string;

			/**
			 * Default configuration values
			 */
			defaults: ConfigAutoFill;
		}
	}
}


/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Options
 */

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
	 * Attach an Editor instance for database updating
	 */
	editor?: any;

	/**
	 *
	 * Initial enablement state of AutoFill
	 */
	enable?: boolean;

	/**
	 * Action that will cause the auto fill drag handle to appear in a cell
	 */
	focus?: 'click' | 'focus' | 'hover' | null;

	/**
	 * Enable / disable user ability to horizontally drag and fill
	 */
	horizontal?: boolean;

	/**
	 * Control automatic update of data when a fill drag is completed
	 */
	 update?: boolean;

	/**
	 * Enable / disable user ability to vertically drag and fill
	 */
	vertical?: boolean;
}

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
