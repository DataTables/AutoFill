describe('autoFill - api - autoFill().enabled()', function() {
	dt.libs({
		js: ['jquery', 'datatables', 'autofill'],
		css: ['datatables', 'autofill']
	});

	let table;

	describe('Check the defaults', function() {
		dt.html('basic_id');
		it('Ensure its a function', function() {
			table = $('#example').DataTable({
				autoFill: true
			});

			expect(typeof table.autoFill().enabled).toBe('function');
		});
		it('Returns API instance', function() {
			expect(typeof table.autoFill().enabled()).toBe('boolean');
		});
	});

	describe('Functional tests', function() {
		dt.html('basic');
		it('Not configured', async function() {
			table = $('#example').DataTable();
			expect(table.autoFill().enabled()).toBe(false);
		});
		it('... and unable to enable', async function() {
			table.autoFill().enable();
			expect(table.autoFill().enabled()).toBe(false);
		});

		dt.html('basic');
		it('Enabled when configured', async function() {
			table = $('#example').DataTable({
				autoFill: true
			});
			expect(table.autoFill().enabled()).toBe(true);
		});
		it('... and able to disable', async function() {
			table.autoFill().disable();
			expect(table.autoFill().enabled()).toBe(false);
		});
		it('... and able to enable', async function() {
			table.autoFill().enable();
			expect(table.autoFill().enabled()).toBe(true);
		});
	});
});
