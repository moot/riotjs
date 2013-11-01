/*global $, DB */

function Todo(db) {
	'use strict';

	db = db || DB('todo-riot');

	var self = $.observable(this);
	var items = db.get();

	self.add = function (name) {
		var item = {
			id: '_' + ('' + Math.random()).slice(2),
			name: name
		};

		items[item.id] = item;

		self.emit('add', item);
	};

	self.edit = function (item) {
		items[item.id] = item;
		self.emit('edit', item);
	};

	self.remove = function (filter) {
		var els = self.items(filter);

		$.each(els, function () {
			 delete items[this.id];
		});

		self.emit('remove', els);
	};

	self.toggle = function (id) {
		var item = items[id];
		item.done = !item.done;
		self.emit('toggle', item);
	};

	// @param filter: <empty>, id, 'active', 'completed'
	self.items = function (filter) {
		var ret = [];

		$.each(items, function (id, item) {
			if (!filter || filter === id || filter === (item.done ? 'completed' : 'active')) {
				ret.push(item);
			}
		});

		return ret;
	};

	// sync database
	self.on('add remove toggle edit', function () {
		db.put(items);
	});
}
