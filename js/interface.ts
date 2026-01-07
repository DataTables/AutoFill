import {
	Api,
	ApiCellMethods,
	CellIdxWithVisible,
	ColumnSelector,
	Dom
} from 'datatables.net';

export interface Classes {
	btn: string;
	close: string;
	closeable: string;
}

export interface Defaults {
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

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * DataTables interface extensions
 */
