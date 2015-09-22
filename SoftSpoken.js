var os = require('os'),
	util = require('util'),

	wutangUtil = require('./util');

function dotSpinnerFactory (message) {
	var l = (wutangUtil.getTerminalWidth() - 2 * this.indentation.length - message.length),
		i = 0;

	return function () {
		return message + new Array(++i % l).join('.');
	}
}

function spriteSpinnerFactory (message) {
	var chars = '▖▘▝▗'.split(''),
		i = 0;

	return function () {
		return message + ' ' + chars[(++i - 1) % chars.length];
	}
}

var DEFAULT_COLORS = {
		log: ['reset'],
		success: ['bold'],
		caption: ['underline'],
		notice: ['yellow'],
		error: ['red'],
		debug: ['dim'],
		propertyKey: ['dim'],
		propertyValue: ['reset'],
		spinnerSpinning: ['dim'],
		spinnerDone: ['dim']
	},
	DEFAULT_CONFIG = {
		indentation: '    ',
		spinnerFactory: dotSpinnerFactory
	};

function Response (colors, config) {
	this.colors = colors
		? Object.keys(DEFAULT_COLORS).reduce(function (clrs, name) {
			clrs[name] = colors[name] === undefined
				? DEFAULT_COLORS[name]
				: (Array.isArray(colors[name])  ? colors[name] : [colors[name]]);
			return clrs;
		}, {})
		: DEFAULT_COLORS;

	config = config || {};
	this.indentation = config.indentation || DEFAULT_CONFIG.indentation;
	this.spinnerFactory = (config.spinnerFactory || DEFAULT_CONFIG.spinnerFactory).bind(this);
	this._spinnerDestroyers = [];
}

Response.prototype._log = function (string, formattingOptions, indentation, skipLineBreak) {
	process.stdout.write(wutangUtil.indentString(wutangUtil.formatString(string, formattingOptions), indentation) + (skipLineBreak ? '' : os.EOL));
};

/**
 * A description of proceedings relevant to the task/whatever
 * @param data
 */
Response.prototype.log = function (data) {
	return this._log(data, this.colors.log, this.indentation);
};

/**
 * Indicates that something the user wanted happened.
 * @param data
 */
Response.prototype.success = function (data) {
	return this._log(data, this.colors.success, this.indentation);
};

/**
 * Indicates the app is working on a concern/task/whatever.
 * @param data
 */
Response.prototype.caption = function (data) {
	console.log('');
	return this._log(data, this.colors.caption);//,this.indentation);
};

/**
 * Something that is probably of interest (but not neccessarily bad), if not important, for the user; exceptions, search results, urgent stuff
 * @param data
 */
Response.prototype.notice = function (data) {
	return this._log(data, this.colors.notice, this.indentation);
};

/**
 * Something messed up
 * @param data
 */
Response.prototype.error = function (data) {
	return this._log(data, this.colors.error, this.indentation);
};

/**
 * Information that the user might not even care about at that time
 * @param data
 */
Response.prototype.debug = function (data) {
	return this._log((data && typeof data === 'object') ? util.inspect(data, {depth: 3, colors: false}) : data, this.colors.debug, this.indentation);
};

Response.prototype.property = function (key, value, keySize) {
	var keyString = wutangUtil.indentString(
			wutangUtil.formatString(wutangUtil.padString(key, keySize), this.colors.propertyKey),
			this.indentation
	),
		seperatorString = '  ',
		valueString = wutangUtil.indentString(
				wutangUtil.formatString(value, this.colors.propertyValue),
				seperatorString,
				wutangUtil.getTerminalWidth() - 2 * this.indentation.length - seperatorString.length - keySize
			)
			.split('\n')
			.map(function (line, i, lines) {
				return (i === 0 ? keyString : wutangUtil.fillString(keySize + this.indentation.length + 1))
					+ line;
			}.bind(this)).join('\n');
	console.log(valueString);
};

Response.prototype.properties = function (obj) {
	var maxLength = 0;
	if(Array.isArray(obj)) {
		obj.forEach(function (k) {
			maxLength = Math.max((k[0] || '').length, maxLength);
		});
		obj.forEach(function (k) {
			this.property(k[0], k[1], maxLength);
		}.bind(this));
	} else {
		Object.keys(obj).forEach(function (k) {
			maxLength = Math.max(k.length, maxLength);
		});
		Object.keys(obj).forEach(function (k) {
			this.property(k, obj[k], maxLength);
		}.bind(this));
	}
};


Response.prototype.destroyAllSpinners = function (message) {
	this._spinnerDestroyers.forEach(function (fn) {
		fn();
	})
}
Response.prototype.spinner = function (message) {
	var startTime = new Date().getTime(),
		formatter = this.spinnerFactory(message),
		interval = setInterval(function() {
			process.stdout.clearLine();
			process.stdout.cursorTo(0);

			this._log(formatter(), this.colors.spinnerSpinning, this.indentation, true);
		}.bind(this), 200),
		destroySpinner = function () {
			var ms = new Date().getTime() - startTime;

			process.stdout.clearLine();
			process.stdout.cursorTo(0);

			this._log(message + ' (' + ms + 'ms)', this.colors.spinnerDone, this.indentation);

			clearInterval(interval);
			this._spinnerDestroyers.splice(this._spinnerDestroyers.indexOf(destroySpinner), 1);
		}.bind(this);

	this._spinnerDestroyers.push(destroySpinner);

	this._log(formatter(), this.colors.spinnerSpinning, this.indentation, true);

	return destroySpinner;
}

module.exports = Response;