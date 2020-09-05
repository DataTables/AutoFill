// Type definitions for datatables.net-autofill 2.2
// Project: https://datatables.net
// Definitions by: Andy Ma <https://github.com/andy-maca>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.4

/// <reference types="jquery" />
/// <reference types="datatables.net"/>

declare namespace DataTables {
  interface Settings {
    /**
     * autoFill extension options
     */
    autoFill?: boolean | AutoFillSettings;
  }

  interface Api {
    /**
     * Initialise AutoFill on the DataTable
     * 
     * @returns Api for chaining with the additional autoFill methods
     */
    autoFill(): AutoFillFunctions | Api;
  }

  interface AutoFillFunctions {
    /**
     * Disable AutoFill. Please note that this disallows future interactions with the table (until re-enabled).
     * 
     * @returns DataTables Api instance
     */
    disable(): Api;

    /**
     * Enable end user and API modification of the focused cells in the DataTable. Differing levels of enablement are available via the optional parameter.
     * 
     * @param flag can be true or false to signify whether to enable or disable
     * @returns DataTables Api instance
     */
    enable(flag?: string | boolean): Api;

    /**
     * This method will return a boolean value indicating if AutoFill is enabled or not on the selected table.
     * 
     * @returns boolean signifying if autofill is enables
     */
    enabled(): boolean;
  }

  interface AutoFillSettings {
    /**
     * Always ask the end user if an action should be taken or not
     */
    alwaysAsk?: boolean;
    /**
     * Select the columns that can be auto filled
     */
    columns: string | number[];
    /**
     *
     * Initial enablement state of AutoFill
     */
    enable?: boolean;
  }
}
