/**
 * @summary     AutoFill
 * @description Add Excel like click and drag auto-fill options to DataTables
 * @version     3.0.0-dev
 * @author      SpryMedia Ltd (datatables.net)
 *
 * This source file is free software, available under the following license:
 *   MIT license - http://datatables.net/license/mit
 *
 * This source file is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE. See the license files for details.
 *
 * For details please refer to: http://www.datatables.net
 */

import DataTable from '../../../js/dataTable';
import { Api, Context } from '../../../types/types';
import {
	Action,
	Classes,
	Defaults,
	InternalDom,
	SelectedCells,
	Settings
} from './interface';

var _instance = 0;
const Api = DataTable.Api;
const dom = DataTable.dom;
const util = DataTable.util;

export default class AutoFill {
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Statics
	 */

	/**
	 * AutoFill actions. The options here determine how AutoFill will fill the data
	 * in the table when the user has selected a range of cells. Please see the
	 * documentation on the DataTables site for full details on how to create plug-
	 * ins.
	 */
	static actions: Record<string, Action> = {
		increment: {
			available: function (dt, cells) {
				let d = cells[0][0].label as any;

				// is numeric test based on jQuery's old `isNumeric` function
				return !isNaN(d - parseFloat(d));
			},

			option: function (dt, cells) {
				return dt.i18n(
					'autoFill.increment',
					'Increment / decrement each cell by: <input type="number" value="1">'
				);
			},

			execute: function (dt, cells, node) {
				let value = cells[0][0].data * 1;
				let increment = node ? parseFloat(node.find('input').val()) : 1;

				for (let i = 0, ien = cells.length; i < ien; i++) {
					for (let j = 0, jen = cells[i].length; j < jen; j++) {
						cells[i][j].set = value;

						value += increment;
					}
				}
			}
		},

		fill: {
			available: function (dt, cells) {
				return true;
			},

			option: function (dt, cells) {
				return dt.i18n(
					'autoFill.fill',
					'Fill all cells with <i>%d</i>',
					cells[0][0].label
				);
			},

			execute: function (dt, cells, node) {
				let value = cells[0][0].data;

				for (let i = 0, ien = cells.length; i < ien; i++) {
					for (let j = 0, jen = cells[i].length; j < jen; j++) {
						cells[i][j].set = value;
					}
				}
			}
		},

		fillHorizontal: {
			available: function (dt, cells) {
				return cells.length > 1 && cells[0].length > 1;
			},

			option: function (dt, cells) {
				return dt.i18n(
					'autoFill.fillHorizontal',
					'Fill cells horizontally'
				);
			},

			execute: function (dt, cells, node) {
				for (let i = 0, ien = cells.length; i < ien; i++) {
					for (let j = 0, jen = cells[i].length; j < jen; j++) {
						cells[i][j].set = cells[i][0].data;
					}
				}
			}
		},

		fillVertical: {
			available: function (dt, cells) {
				return cells.length > 1 && cells[0].length > 1;
			},

			option: function (dt, cells) {
				return dt.i18n(
					'autoFill.fillVertical',
					'Fill cells vertically'
				);
			},

			execute: function (dt, cells, node) {
				for (let i = 0, ien = cells.length; i < ien; i++) {
					for (let j = 0, jen = cells[i].length; j < jen; j++) {
						cells[i][j].set = cells[0][j].data;
					}
				}
			}
		},

		// Special type that does not make itself available, but is added
		// automatically by AutoFill if a multi-choice list is shown. This allows
		// sensible code reuse
		cancel: {
			available: function () {
				return false;
			},

			option: function (dt) {
				return dt.i18n('autoFill.cancel', 'Cancel');
			},

			execute: function () {
				return false;
			}
		}
	};

	/** Class names used by AutoFill for customisation */
	static classes: Classes = {
		btn: 'btn',
		closeable: 'dtaf-popover-closeable'
	};

	/** Defaults */
	static defaults: Defaults = {
		alwaysAsk: false,
		closeButton: true,
		focus: null,
		columns: '',
		enable: true,
		update: true,
		editor: null,
		vertical: true,
		horizontal: true
	};

	/** AutoFill version */
	static version: '3.0.0-dev';

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Public methods (exposed via the DataTables API below)
	 */

	public enabled() {
		return this.s.enabled;
	}

	public enable(flag: boolean = true) {
		let that = this;

		if (flag === false) {
			return this.disable();
		}

		this.s.enabled = true;

		this._focusListener();

		this.dom.handle.on('mousedown touchstart', function (e) {
			that._mousedown(e);
			return false;
		});

		let orientationReset = function () {
			that.s.handle = {
				height: 0,
				width: 0
			};

			that.dom.handle.css({
				height: '',
				width: ''
			});

			if (that.dom.attachedTo) {
				that._attach(that.dom.attachedTo);
			}
		};

		window.addEventListener('resize', function () {
			let handle = dom.s('div.dt-autofill-handle');

			if (handle.count() > 0 && that.dom.attachedTo) {
				that._attach(that.dom.attachedTo);
			}
		});

		window.addEventListener('orientationchange', function () {
			setTimeout(function () {
				orientationReset();
				setTimeout(orientationReset, 150);
			}, 50);
		});

		return this;
	}

	public disable() {
		this.s.enabled = false;

		this._focusListenerRemove();

		return this;
	}

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Properties
	 */
	private c: Defaults;

	private dom: InternalDom;

	private s: Settings;

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Constructor
	 */
	constructor(dt: Api | Context, opts?: Partial<Defaults>) {
		this.c = util.object.assignDeep({}, AutoFill.defaults, opts);

		this.s = {
			dt: new DataTable.Api(dt),
			enabled: false,
			end: { column: 0, row: 0 },
			handle: {
				height: 0,
				width: 0
			},
			namespace: '.autoFill' + _instance++,
			scroll: {
				windowHeight: 0,
				windowWidth: 0,
				dtTop: 0,
				dtLeft: 0,
				dtHeight: 0,
				dtWidth: 0
			},
			scrollInterval: null,
			start: { column: 0, row: 0 }
		};

		this.dom = {
			attachedTo: null,
			background: dom.c('div').classAdd('dt-autofill-background'),
			closeButton: dom
				.c('div')
				.classAdd('dtaf-popover-close')
				.html('&times;'),
			dtScroll: null,
			handle: dom.c('div').classAdd('dt-autofill-handle'),
			list: dom
				.c('div')
				.classAdd('dt-autofill-list')
				.html(this.s.dt.i18n('autoFill.info', ''))
				.attr('aria-modal', true)
				.attr('role', 'dialog')
				.append(dom.c('div').classAdd('dt-autofill-list-items')),
			offsetParent: null,
			start: null,
			select: {
				top: dom.c('div').classAdd('dt-autofill-select top'),
				right: dom.c('div').classAdd('dt-autofill-select right'),
				bottom: dom.c('div').classAdd('dt-autofill-select bottom'),
				left: dom.c('div').classAdd('dt-autofill-select left')
			}
		};

		/* Constructor logic */
		this._init();
	}

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
	 * Private methods
	 */

	/**
	 * Initialise the RowReorder instance
	 */
	private _init() {
		let that = this;
		let dt = this.s.dt;

		// Need to account for scrolling as it has a different DOM structure
		let dtScroll = dom
			.s(this.s.dt.table().container())
			.find('div.dt-scroll-body');

		// Make the instance accessible to the API
		dt.settings()[0].autoFill = this;

		if (dtScroll.count()) {
			this.dom.dtScroll = dtScroll;

			// Need to scroll container to be the offset parent
			if (dtScroll.css('position') === 'static') {
				dtScroll.css('position', 'relative');
			}
		}

		if (this.c.enable !== false) {
			this.enable();
		}

		dt.on('destroy.autoFill', function () {
			that._focusListenerRemove();
		});
	}

	/**
	 * Display the AutoFill drag handle by appending it to a table cell. This is
	 * the opposite of the _detach method.
	 *
	 * @param node Cell to insert the handle into
	 */
	private _attach(node: HTMLElement) {
		let dt = this.s.dt;
		let idx = dt.cell(node).index();
		let handle = this.dom.handle;
		let handleDim = this.s.handle;

		if (
			!idx ||
			dt.columns(this.c.columns).indexes().indexOf(idx.column) === -1
		) {
			this._detach();
			return;
		}

		if (!this.dom.offsetParent) {
			// We attach to the table's offset parent
			this.dom.offsetParent = dt.table().node()
				.offsetParent as HTMLElement | null;
		}

		if (!handleDim.height || !handleDim.width) {
			// Append to document so we can get its size. Not expecting it to
			// change during the life time of the page
			handle.appendTo('body');
			handleDim.height = handle.height('outer');
			handleDim.width = handle.width('outer');
		}

		// Might need to go through multiple offset parents
		let offset = this._getPosition(node, this.dom.offsetParent);

		this.dom.attachedTo = node;
		handle
			.css({
				top: offset.top + node.offsetHeight - handleDim.height + 'px',
				left: offset.left + node.offsetWidth - handleDim.width + 'px'
			})
			.appendTo(this.dom.offsetParent);
	}

	/**
	 * Determine can the fill type should be. This can be automatic, or ask the
	 * end user.
	 *
	 * @param cells Information about the selected cells from the key up
	 *   function
	 */
	private _actionSelector(cells: SelectedCells[][]) {
		let that = this;
		let dt = this.s.dt;
		let actions = AutoFill.actions;
		let available: string[] = [];

		// "Ask" each plug-in if it wants to handle this data
		util.object.each(actions, function (key, action) {
			if (action.available(dt, cells)) {
				available.push(key);
			}
		});

		if (available.length === 1 && this.c.alwaysAsk === false) {
			// Only one action available - enact it immediately
			let result = actions[available[0]].execute(dt, cells, null);

			this._update(result, cells);
		}
		else if (available.length > 1 || this.c.alwaysAsk) {
			// Multiple actions available - ask the end user what they want to
			// do
			let list = this.dom.list
				.children('div.dt-autofill-list-items')
				.empty();

			// Add a cancel option
			available.push('cancel');

			for (let i = 0; i < available.length; i++) {
				let name = available[i];

				list.append(
					dom
						.c('button')
						.html(actions[name].option(dt, cells))
						.append(
							dom
								.c('span')
								.classAdd('dt-autofill-button')
								.html(dt.i18n('autoFill.button', '&gt;'))
						)
						.on('click', function (e) {
							if (e.target.nodeName.toLowerCase() !== 'button') {
								return;
							}

							let result = actions[name].execute(
								dt,
								cells,
								dom.s(this).closest('button')
							);
							that._update(result, cells);

							that.dom.background.remove();
							that.dom.list.remove();
						})
				);
			}

			this.dom.background.appendTo('body');
			this.dom.background.one('click', function () {
				that.dom.background.remove();
				that.dom.list.remove();
			});
			this.dom.list.appendTo('body');

			if (this.c.closeButton) {
				this.dom.list
					.prepend(this.dom.closeButton)
					.classAdd(AutoFill.classes.closeable);

				this.dom.closeButton.on('click', function () {
					return that.dom.background.trigger('click');
				});
			}

			this.dom.list.css(
				'margin-top',
				(this.dom.list.height('outer') / 2) * -1 + 'px'
			);
		}
	}

	/**
	 * Remove the AutoFill handle from the document
	 */
	private _detach() {
		this.dom.attachedTo = null;
		this.dom.handle.detach();
	}

	/**
	 * Draw the selection outline by calculating the range between the start
	 * and end cells, then placing the highlighting elements to draw a rectangle
	 *
	 * @param target End cell
	 * @param e Originating event
	 * @private
	 */
	private _drawSelection(target: HTMLElement, e: MouseEvent) {
		// Calculate boundary for start cell to this one
		var dt = this.s.dt;
		var start = this.s.start;
		var startCell = dom.s(this.dom.start);
		var end = {
			row: this.c.vertical
				? dt
						.rows({ page: 'current' })
						.nodes()
						.indexOf(target.parentNode)
				: start.row,
			column: this.c.horizontal ? dom.s(target).index() : start.column
		};
		var colIndx = dt.column.index('toData', end.column);
		var endRow = dt.row(':eq(' + end.row + ')', { page: 'current' }); // Workaround for M581
		var endCell = dom.s(dt.cell(endRow.index(), colIndx).node());

		// Be sure that is a DataTables controlled cell
		if (!dt.cell(endCell.get(0)).any()) {
			return;
		}

		// if target is not in the columns available - do nothing
		if (
			dt.columns(this.c.columns).indexes().indexOf(colIndx) === -1 ||
			end.row === -1
		) {
			return;
		}

		this.s.end = end;

		var top, bottom, left, right, height, width;

		top = start.row < end.row ? startCell : endCell;
		bottom = start.row < end.row ? endCell : startCell;
		left = start.column < end.column ? startCell : endCell;
		right = start.column < end.column ? endCell : startCell;

		top = this._getPosition(top.get(0)).top;
		left = this._getPosition(left.get(0)).left;
		height =
			this._getPosition(bottom.get(0)).top + bottom.height('outer') - top;
		width =
			this._getPosition(right.get(0)).left + right.width('outer') - left;

		var select = this.dom.select;

		select.top.css({
			top: top + 'px',
			left: left + 'px',
			width: width + 'px'
		});

		select.left.css({
			top: top + 'px',
			left: left + 'px',
			height: height + 'px'
		});

		select.bottom.css({
			top: top + height + 'px',
			left: left + 'px',
			width: width + 'px'
		});

		select.right.css({
			top: top + 'px',
			left: left + width + 'px',
			height: height + 'px'
		});
	}

	/**
	 * Use the Editor API to perform an update based on the new data for the
	 * cells
	 *
	 * @param cells Information about the selected cells from the key up
	 *   function
	 */
	private _editor(cells: SelectedCells[][]) {
		let dt = this.s.dt;
		let editor = this.c.editor;

		if (!editor) {
			return;
		}

		// Build the object structure for Editor's multi-row editing
		let idValues: Record<string, any> = {};
		let nodes = [];
		let fields = editor.fields();

		for (let i = 0, ien = cells.length; i < ien; i++) {
			for (let j = 0, jen = cells[i].length; j < jen; j++) {
				let cell = cells[i][j];

				// Determine the field name for the cell being edited
				let col = dt.settings()[0].columns[cell.index.column];
				let fieldName = col.editField;

				if (fieldName === undefined) {
					let dataSrc = col.data;

					// dataSrc is the `field.data` property, but we need to set
					// using the field name, so we need to translate from the
					// data to the name
					for (let k = 0, ken = fields.length; k < ken; k++) {
						let field = editor.field(fields[k]);

						if (field.dataSrc() === dataSrc) {
							fieldName = field.name();
							break;
						}
					}
				}

				if (!fieldName) {
					throw (
						'Could not automatically determine field data. ' +
						'Please see https://datatables.net/tn/11'
					);
				}

				if (!idValues[fieldName]) {
					idValues[fieldName] = {};
				}

				let id = dt.row(cell.index.row).id();
				idValues[fieldName][id] = cell.set;

				// Keep a list of cells so we can activate the bubble editing
				// with them
				nodes.push(cell.index);
			}
		}

		// Perform the edit using bubble editing as it allows us to specify
		// the cells to be edited, rather than using full rows
		editor
			.bubble(nodes, false)
			.multiSet(idValues)
			.submit(null, function () {
				// If an error happens, Editor will show an alert, and then we
				// need to finish the edit since we can't do anything else.
				editor.close();
			});
	}

	/**
	 * Emit an event on the DataTable for listeners
	 *
	 * @param name Event name
	 * @param args Event arguments
	 */
	private _emitEvent(name: string, args: any[]) {
		this.s.dt.trigger(name, args);
	}

	/**
	 * Attach suitable listeners (based on the configuration) that will attach
	 * and detach the AutoFill handle in the document.
	 */
	private _focusListener() {
		var that = this;
		var dt = this.s.dt;
		var namespace = this.s.namespace;
		var focus =
			this.c.focus !== null
				? this.c.focus
				: dt.init().keys || dt.settings()[0].keytable
				? 'focus'
				: 'hover';

		// All event listeners attached here are removed in the `destroy`
		// callback in the constructor
		if (focus === 'focus') {
			dt.on('key-focus.autoFill', function (e, dt, cell) {
				that._attach(cell.node());
			}).on('key-blur.autoFill', function (e, dt, cell) {
				that._detach();
			});
		}
		else if (focus === 'click') {
			dom.s(dt.table().body()).on(
				'click' + namespace,
				'td, th',
				function (e) {
					that._attach(this);
				}
			);

			dom.s(document.body).on('click' + namespace, function (e) {
				if (!dom.s(e.target).closest(dt.table().body()).count()) {
					that._detach();
				}
			});
		}
		else {
			dom.s(dt.table().body())
				.on(
					'mouseenter' + namespace + ' touchstart' + namespace,
					'td, th',
					function (e) {
						that._attach(this);
					}
				)
				.on(
					'mouseleave' + namespace + 'touchend' + namespace,
					function (e) {
						if (
							dom
								.s(e.relatedTarget)
								.classHas('dt-autofill-handle')
						) {
							return;
						}

						that._detach();
					}
				);
		}
	}

	private _focusListenerRemove() {
		var dt = this.s.dt;

		dt.off('.autoFill');
		dom.s(dt.table().body()).off(this.s.namespace);
		dom.s(document.body).off(this.s.namespace);
	}

	/**
	 * Get the position of a node, relative to another, including any scrolling
	 * offsets.
	 *
	 * @param node Node to get the position of
	 * @param targetHost Node to use as the parent
	 * @return Offset calculation
	 */
	private _getPosition(node: HTMLElement, targetHost?: HTMLElement | null) {
		let targetParent = dom.s(this.s.dt.table().node().offsetParent),
			currNode = node,
			currOffsetParent,
			top = 0,
			left = 0;

		if (targetHost) {
			targetParent = dom.s(targetHost);
		}

		do {
			let positionTop = currNode.offsetTop;
			let positionLeft = currNode.offsetLeft;

			currOffsetParent = dom.s(currNode.offsetParent);

			top +=
				positionTop +
				parseInt(currOffsetParent.css('border-top-width') || '0') * 1;
			left +=
				positionLeft +
				parseInt(currOffsetParent.css('border-left-width') || '0') * 1;

			// Emergency fall back. Shouldn't happen, but just in case!
			if (currNode.nodeName.toLowerCase() === 'body') {
				break;
			}

			currNode = currOffsetParent.get(0); // for next loop
		} while (currOffsetParent.get(0) !== targetParent.get(0));

		return {
			top: top,
			left: left
		};
	}

	/**
	 * Start mouse drag - selects the start cell
	 *
	 * @param e Mouse down event
	 */
	private _mousedown(e: MouseEvent) {
		let that = this;
		let dt = this.s.dt;

		this.dom.start = this.dom.attachedTo!;
		this.s.start = {
			row: dt
				.rows({ page: 'current' })
				.nodes()
				.indexOf(dom.s(this.dom.start).parent().get(0)),
			column: dom.s(this.dom.start).index()
		};

		dom.s(document.body)
			.on('mousemove.autoFill touchmove.autoFill', function (e) {
				that._mousemove(e);
				// If it is a touch event then when the touch ends we need to
				// remove the handle
				if (e.type === 'touchmove') {
					dom.s(document.body).one('touchend.autoFill', function () {
						that._detach();
					});
				}
			})
			.on('mouseup.autoFill touchend.autoFill', function (e) {
				that._mouseup(e);
			});

		let select = this.dom.select;
		let offsetParent = dt.table().node().offsetParent;

		select.top.appendTo(offsetParent);
		select.left.appendTo(offsetParent);
		select.right.appendTo(offsetParent);
		select.bottom.appendTo(offsetParent);

		this._drawSelection(this.dom.start, e);

		this.dom.handle.css('display', 'none');

		// Cache scrolling information so mouse move doesn't need to read.
		// This assumes that the window and DT scroller will not change size
		// during an AutoFill drag, which I think is a fair assumption
		let scrollWrapper = this.dom.dtScroll;

		this.s.scroll = {
			windowHeight: window.innerHeight,
			windowWidth: window.innerWidth,
			dtTop: scrollWrapper ? scrollWrapper.offset().top : 0,
			dtLeft: scrollWrapper ? scrollWrapper.offset().left : 0,
			dtHeight: scrollWrapper ? scrollWrapper.height('outer') : 0,
			dtWidth: scrollWrapper ? scrollWrapper.width('outer') : 0
		};
	}

	/**
	 * Mouse drag - selects the end cell and update the selection display for
	 * the end user
	 *
	 * @param e Mouse move event
	 */
	private _mousemove(e: MouseEvent & TouchEvent) {
		let target: any =
			e.touches && e.touches.length
				? document.elementFromPoint(
						e.touches[0].clientX,
						e.touches[0].clientY
				  )
				: e.target;

		let name = target.nodeName.toLowerCase();

		if (name !== 'td' && name !== 'th') {
			return;
		}

		this._drawSelection(target, e);
		this._shiftScroll(e);
	}

	/**
	 * End mouse drag - perform the update actions
	 *
	 * @param e Mouse up event
	 * @private
	 */
	private _mouseup(e: MouseEvent) {
		dom.s(document.body).off('.autoFill');

		let that = this;
		let dt = this.s.dt;
		let select = this.dom.select;

		select.top.remove();
		select.left.remove();
		select.right.remove();
		select.bottom.remove();

		this.dom.handle.css('display', 'block');

		// Display complete - now do something useful with the selection!
		let start = this.s.start;
		let end = this.s.end;

		// Haven't selected multiple cells, so nothing to do
		if (start.row === end.row && start.column === end.column) {
			return;
		}

		let startDt = dt.cell(
			':eq(' + start.row + ')',
			start.column + ':visible',
			{ page: 'current' }
		);

		// If Editor is active inside this cell (inline editing) we need to wait
		// for Editor to submit and then we can loop back and trigger the fill.
		if (dom.s(startDt.node()).find('div.DTE').count()) {
			let editor = (dt as any).editor();

			editor
				.on('submitSuccess.dtaf close.dtaf', function () {
					editor.off('.dtaf');

					setTimeout(function () {
						that._mouseup(e);
					}, 100);
				})
				.on(
					'submitComplete.dtaf preSubmitCancelled.dtaf close.dtaf',
					function () {
						editor.off('.dtaf');
					}
				);

			// Make the current input submit
			editor.submit();

			return;
		}

		// Build a matrix representation of the selected rows
		let rows = this._range(start.row, end.row);
		let columns = this._range(start.column, end.column);
		let selected = [];
		let dtSettings = dt.settings()[0];
		let dtColumns = dtSettings.columns;
		let enabledColumns = dt.columns(this.c.columns).indexes();

		for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
			selected.push(
				columns
					.map(function (column) {
						let row = dt.row(':eq(' + rows[rowIdx] + ')', {
							page: 'current'
						});
						let cell = dt.cell(row.index(), column + ':visible');
						let data = cell.data();
						let cellIndex = cell.index();
						let editField = dtColumns[cellIndex.column].editField;

						if (editField !== undefined) {
							data = DataTable.util.get(editField)(
								dt.row(cellIndex.row).data()
							);
						}

						if (enabledColumns.indexOf(cellIndex.column) === -1) {
							return;
						}

						return {
							cell: cell,
							data: data,
							label: cell.data(),
							index: cellIndex
						};
					})
					.filter(d => !!d)
			);
		}

		this._actionSelector(selected);

		// Stop shiftScroll
		if (this.s.scrollInterval) {
			clearInterval(this.s.scrollInterval);
			this.s.scrollInterval = null;
		}
	}

	/**
	 * Create an array with a range of numbers defined by the start and end
	 * parameters passed in (inclusive!).
	 *
	 * @param start Start
	 * @param end End
	 */
	private _range(start: number, end: number) {
		var out = [];
		var i;

		if (start <= end) {
			for (i = start; i <= end; i++) {
				out.push(i);
			}
		}
		else {
			for (i = start; i >= end; i--) {
				out.push(i);
			}
		}

		return out;
	}

	/**
	 * Move the window and DataTables scrolling during a drag to scroll new
	 * content into view. This is done by proximity to the edge of the scrolling
	 * container of the mouse - for example near the top edge of the window
	 * should scroll up. This is a little complicated as there are two elements
	 * that can be scrolled - the window and the DataTables scrolling view port
	 * (if scrollX and / or scrollY is enabled).
	 *
	 * @param e Mouse move event object
	 */
	private _shiftScroll(e: MouseEvent & TouchEvent) {
		var that = this;
		var scroll = this.s.scroll;
		var runInterval = false;
		var scrollSpeed = 5;
		var buffer = 65;

		// Different values if using a touchscreen
		var pageX = !e.type.includes('touch')
			? e.pageX - window.scrollX
			: e.touches[0].clientX;
		var pageY = !e.type.includes('touch')
			? e.pageY - window.scrollY
			: e.touches[0].clientY;
		var windowY = pageY,
			windowX = pageX,
			windowVert,
			windowHoriz,
			dtVert,
			dtHoriz;

		// Window calculations - based on the mouse position in the window,
		// regardless of scrolling
		if (windowY < buffer) {
			windowVert = scrollSpeed * -1;
		}
		else if (windowY > scroll.windowHeight - buffer) {
			windowVert = scrollSpeed;
		}

		if (windowX < buffer) {
			windowHoriz = scrollSpeed * -1;
		}
		else if (windowX > scroll.windowWidth - buffer) {
			windowHoriz = scrollSpeed;
		}

		// DataTables scrolling calculations - based on the table's position in
		// the document and the mouse position on the page
		if (scroll.dtTop !== null && pageY < scroll.dtTop + buffer) {
			dtVert = scrollSpeed * -1;
		}
		else if (
			scroll.dtTop !== null &&
			pageY > scroll.dtTop + scroll.dtHeight - buffer
		) {
			dtVert = scrollSpeed;
		}

		if (scroll.dtLeft !== null && pageX < scroll.dtLeft + buffer) {
			dtHoriz = scrollSpeed * -1;
		}
		else if (
			scroll.dtLeft !== null &&
			pageX > scroll.dtLeft + scroll.dtWidth - buffer
		) {
			dtHoriz = scrollSpeed;
		}

		// This is where it gets interesting. We want to continue scrolling
		// without requiring a mouse move, so we need an interval to be
		// triggered. The interval should continue until it is no longer needed,
		// but it must also use the latest scroll commands (for example consider
		// that the mouse might move from scrolling up to scrolling left, all
		// with the same interval running. We use the `scroll` object to "pass"
		// this information to the interval. Can't use local variables as they
		// wouldn't be the ones that are used by an already existing interval!
		if (windowVert || windowHoriz || dtVert || dtHoriz) {
			scroll.windowVert = windowVert;
			scroll.windowHoriz = windowHoriz;
			scroll.dtVert = dtVert;
			scroll.dtHoriz = dtHoriz;

			runInterval = true;
		}
		else if (this.s.scrollInterval) {
			// Don't need to scroll - remove any existing timer
			clearInterval(this.s.scrollInterval);
			this.s.scrollInterval = null;
		}

		// If we need to run the interval to scroll and there is no existing
		// interval (if there is an existing one, it will continue to run)
		if (!this.s.scrollInterval && runInterval) {
			this.s.scrollInterval = setInterval(function () {
				// Don't need to worry about setting scroll <0 or beyond the
				// scroll bound as the browser will just reject that.
				window.scrollTo(
					window.scrollX +
						(scroll.windowHoriz ? scroll.windowHoriz : 0),
					window.scrollY + (scroll.windowVert ? scroll.windowVert : 0)
				);

				// DataTables scrolling
				if (scroll.dtVert || scroll.dtHoriz) {
					var scroller = that.dom.dtScroll?.get(0);

					if (scroller && scroll.dtVert) {
						scroller.scrollTop += scroll.dtVert;
					}

					if (scroller && scroll.dtHoriz) {
						scroller.scrollLeft += scroll.dtHoriz;
					}
				}
			}, 20);
		}
	}

	/**
	 * Update the DataTable after the user has selected what they want to do
	 *
	 * @param result Return from the `execute` method - can be false internally
	 *   to do nothing. This is not documented for plug-ins and is used only by
	 *   the cancel option.
	 * @param cells Information about the selected cells from the key up
	 *   function, augmented with the set values
	 */
	private _update(result: void | false, cells: SelectedCells[][]) {
		// Do nothing on `false` return from an execute function
		if (result === false) {
			return;
		}

		let dt = this.s.dt;
		let cell;
		let columns = dt.columns(this.c.columns).indexes();

		// Potentially allow modifications to the cells matrix
		this._emitEvent('preAutoFill', [dt, cells]);

		this._editor(cells);

		// Automatic updates are not performed if `update` is null and the
		// `editor` parameter is passed in - the reason being that Editor will
		// update the data once submitted
		let update =
			this.c.update !== null
				? this.c.update
				: this.c.editor
				? false
				: true;

		if (update) {
			for (let i = 0, ien = cells.length; i < ien; i++) {
				for (let j = 0, jen = cells[i].length; j < jen; j++) {
					cell = cells[i][j];

					if (columns.indexOf(cell.index.column) !== -1) {
						cell.cell.data(cell.set);
					}
				}
			}

			dt.draw(false);
		}

		this._emitEvent('autoFill', [dt, cells]);
	}
}
