import DataTables, {
	Api,
	ApiCellMethods,
	CellIdxWithVisible,
	ColumnSelector,
	Dom
} from 'datatables.net';


export default DataTables;

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * DataTables' types integration
 */
declare module 'datatables.net' {
	interface Options {
		/**
		 * autoFill extension options
		 */
		autoFill?: boolean | Partial<AutoFillDefaults>;
	}

	interface Defaults {
		/**
		 * autoFill extension options
		 */
		autoFill?: AutoFillDefaults;
	}

	interface Language {
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

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Internal
 */


export interface Classes {
	btn: string;
	close: string;
	closeable: string;
}

export interface AutoFillDefaults {
	/** Ask user what they want to do, even for a single option */
	alwaysAsk: boolean;

	/** Show a "Close" button in the list of options */
	closeButton: boolean;

	/** What will trigger a focus */
	focus: 'click' | 'focus' | 'hover' | null;

	/** Columns to provide auto fill for */
	columns: ColumnSelector;

	/** Enable AutoFill on load */
	enable: boolean;

	/** Update the cells after a drag */
	update: boolean;

	/** Editor instance for automatic submission */
	editor: any;

	/** Enable vertical fill */
	vertical: boolean;

	/** Enable horizontal fill */
	horizontal: boolean;
}

/** Common and useful DOM elements for the class instance */
export interface InternalDom {
	attachedTo: HTMLElement | null;

	/** Fill type chooser background */
	container: Dom;

	/** Popover close button */
	closeButton: Dom;

	/** DataTables scrolling container */
	dtScroll: Dom | null;

	/** AutoFill handle */
	handle: Dom;

	/** Fill type chooser */
	list: Dom;

	/** Offset parent element */
	offsetParent: HTMLElement | null;

	/**
	 * Selected cells outline - Need to use 4 elements, otherwise the mouse over
	 * if you back into the selected rectangle will be over that element, rather
	 * than the cells!
	 */
	select: {
		top: Dom;
		right: Dom;
		bottom: Dom;
		left: Dom;
	};

	start: HTMLElement | null;
}

export interface Action {
	available(dt: Api, cells: SelectedCells[][]): boolean;
	option(dt: Api, cells: SelectedCells[][]): string;
	execute(dt: Api, cells: SelectedCells[][], node: Dom | null): void | false;
}

export interface SelectedCells {
	cell: ApiCellMethods<any>;
	data: any;
	index: CellIdxWithVisible;
	label: string;
	set?: any;
}

export interface Settings {
	/** Host DataTable instance */
	dt: Api;

	/** Enabled setting */
	enabled: boolean;

	end: {
		column: number;
		row: number;
	};

	/** Cached handle size */
	handle: {
		height: number;
		width: number;
	};

	/** Unique namespace for events attached to the document */
	namespace: string;

	start: {
		column: number;
		row: number;
	};

	/** Cached dimension information for use in the mouse move event handler */
	scroll: {
		windowHeight: number;
		windowWidth: number;
		dtTop: number;
		dtLeft: number;
		dtHeight: number;
		dtWidth: number;
		windowVert?: number;
		windowHoriz?: number;
		dtVert?: number;
		dtHoriz?: number;
	};

	/** Interval object used for smooth scrolling */
	scrollInterval: any;
}
