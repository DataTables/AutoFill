/*! Bootstrap integration for DataTables' AutoFill
 * ©2015 SpryMedia Ltd - datatables.net/license
 */

(function( factory ){
	if ( typeof define === 'function' && define.amd ) {
		// AMD
		define( ['jquery', 'datatables-bs', 'datatables-autofill'], factory );
	}
	else if ( typeof exports === 'object' ) {
		// Node / CommonJS
		module.exports = function ($) {
			if ( ! $ ) { $ = require('jquery'); }
			if ( ! $.fn.dataTable ) { require('datatables-bs')($); }
			if ( ! $.fn.dataTable.AutoFill ) { require('datatables-autofill')($); }

			factory( $ );
		};
	}
	else {
		// Browser
		factory( jQuery );
	}
}(function( $ ) {
'use strict';
var DataTable = $.fn.dataTable;


DataTable.AutoFill.classes.btn = 'btn btn-primary';


return DataTable;
}));