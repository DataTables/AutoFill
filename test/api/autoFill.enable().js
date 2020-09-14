describe('autoFill - api - autoFill().enable()', function() {
	dt.libs({
		js: ['jquery', 'datatables', 'autofill'],
		css: ['datatables', 'autofill']
	});

	let table;

	// Basic tests - more complex tests in autoFill().enabled()
	describe('Check the defaults', function() {
		dt.html('basic_id');
		it('Ensure its a function', function() {
			table = $('#example').DataTable({
				autoFill: true
			});

			expect(typeof table.autoFill().enable).toBe('function');
		});
		it('Returns API instance', function() {
			expect(table.autoFill().enable() instanceof $.fn.dataTable.Api).toBe(true);
		});
	});
});
