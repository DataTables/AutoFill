import DataTable, { Context } from 'datatables.net';
import AutoFill from './AutoFill';
import { Defaults } from './interface';

declare module 'datatables.net' {
	interface Context {
		autoFill: AutoFill;
	}
}

if (!DataTable || !DataTable.versionCheck || !DataTable.versionCheck('3')) {
	throw 'Warning: AutoFill requires DataTables 3 or greater';
}

const Api = DataTable.Api;
const dom = DataTable.dom;
const util = DataTable.util;

// Doesn't do anything - Not documented
Api.register('autoFill()', function () {
	return this.inst(this.context);
});

Api.register('autoFill().enabled()', function () {
	var ctx = this.context[0];

	return ctx.autoFill ? ctx.autoFill.enabled() : false;
});

Api.register('autoFill().enable()', function (flag) {
	return this.iterator('table', function (ctx) {
		if (ctx.autoFill) {
			ctx.autoFill.enable(flag);
		}
	});
});

Api.register('autoFill().disable()', function () {
	return this.iterator('table', function (ctx) {
		if (ctx.autoFill) {
			ctx.autoFill.disable();
		}
	});
});

// Attach a listener to the document which listens for DataTables initialisation
// events so we can automatically initialise
dom.s(document).on('preInit.dt.autofill', function (e, settings: Context) {
	if (e.namespace !== 'dt') {
		return;
	}

	let init = (settings.init as any).autoFill as boolean | Partial<Defaults>;
	let defaults = (DataTable.defaults as any).autoFill as
		| boolean
		| Partial<Defaults>;

	if (init || defaults) {
		let opts: Partial<Defaults> = {};

		if (util.is.plainObject(defaults)) {
			util.object.assign(opts, defaults);
		}

		if (util.is.plainObject(init)) {
			util.object.assign(opts, init);
		}

		if (init !== false) {
			new AutoFill(settings, opts);
		}
	}
});

// Alias for access
(DataTable as any).AutoFill = AutoFill;
