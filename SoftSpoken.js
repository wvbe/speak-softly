'use strict';

const os = require('os');
const util = require('util');

const Table = require('cli-table');

const primitives = require('./primitives');

function dotSpinnerFactory (message) {
	let l = (primitives.getTerminalWidth() - 2 * this.indentation.length - message.length),
		i = 0;

	return function () {
		return message + new Array(++i % l).join('.');
	}
}

function spriteSpinnerFactory (message) {
	let chars = '▖▘▝▗'.split(''),
		i = 0;

	return function () {
		return message + ' ' + chars[(++i - 1) % chars.length];
	}
}

const tableChars = {
	compact: {
		'top': '', 'top-mid': '', 'top-left': '', 'top-right': ''
		, 'bottom': '', 'bottom-mid': '', 'bottom-left': '', 'bottom-right': ''
		, 'left': '', 'left-mid': '', 'mid': '', 'mid-mid': ''
		, 'right': '', 'right-mid': '', 'middle': '  '
	},
	expanded: {
		'top': '', 'top-mid': '', 'top-left': '', 'top-right': ''
		, 'bottom': '', 'bottom-mid': '', 'bottom-left': '', 'bottom-right': ''
		, 'left': '', 'left-mid': '', 'mid': '─', 'mid-mid': '──'
		, 'right': '', 'right-mid': '', 'middle': '  '
	},
	original: {
		'top': '═', 'top-mid': '╤', 'top-left': '╔', 'top-right': '╗'
		, 'bottom': '═', 'bottom-mid': '╧', 'bottom-left': '╚', 'bottom-right': '╝'
		, 'left': '║', 'left-mid': '╟', 'mid': '─', 'mid-mid': '┼'
		, 'right': '║', 'right-mid': '╢', 'middle': '│'
	}
}
let DEFAULT_COLORS = {
		log: ['reset'],
		success: ['bold'],
		caption: ['underline'],
		notice: ['yellow'],
		error: ['red'],
		debug: ['dim'],
		propertyKey: ['dim'],
		propertyValue: ['reset'],
		tableHeader: ['dim'],
		spinnerSpinning: ['dim'],
		spinnerDone: ['dim']
	},
	DEFAULT_CONFIG = {
		indentation: '    ',
		spinnerFactory: spriteSpinnerFactory,
		spinnerInterval: 200
	};

let LOG = Symbol(),
	DESTROYERS = Symbol();

class Response {
	constructor (colors, config) {
		this.colors = Object.assign(DEFAULT_COLORS, colors);

		Object.keys(this.colors).forEach(name => {
			if (!this.colors[name])
				this.colors[name] = ['dim'];
			else if (!Array.isArray(this.colors[name]))
				this.colors[name] = [this.colors[name]];
		});

		Object.assign(this, DEFAULT_CONFIG, config);
		this[DESTROYERS] = [];
	}
	
	[LOG] (string, formattingOptions, indentation, skipLineBreak) {
		process.stdout.write(primitives.indentString(primitives.formatString(string, formattingOptions), indentation) + (skipLineBreak ? '' : os.EOL));
	}

	/**
	 * A description of proceedings relevant to the task/whatever
	 * @param data
	 */
	log (data) {
		return this[LOG](data, this.colors.log, this.indentation);
	}

	/**
	 * Indicates that something the user wanted happened.
	 * @param data
	 */
	success (data) {
		return this[LOG](data, this.colors.success, this.indentation);
	}

	/**
	 * Indicates the app is working on a concern/task/whatever.
	 * @param data
	 */
	caption (data) {
		console.log('');
		return this[LOG](data, this.colors.caption,this.indentation);
	}

	/**
	 * Something that is probably of interest (but not neccessarily bad), if not important, for the user; exceptions, search results, urgent stuff
	 * @param data
	 */
	notice (data) {
		return this[LOG](data, this.colors.notice, this.indentation);
	}

	/**
	 * Something messed up
	 * @param data
	 */
	error (data) {
		return this[LOG](data, this.colors.error, this.indentation);
	}

	/**
	 * Information that the user might not even care about at that time
	 * @param data
	 */
	debug (data) {
		return this[LOG]((data && typeof data === 'object')
			? util.inspect(data, {depth: 3, colors: false})
			: data, this.colors.debug, this.indentation);
	}

	property (key, value, keySize, formattingName) {
		keySize = keySize || 0;
		let keyString = primitives.indentString(
				primitives.formatString(primitives.padString(key, keySize), this.colors.propertyKey),
				this.indentation
			),
			seperatorString = '  ';

		console.log(primitives.indentString(
				primitives.formatString(value, formattingName
					? this.colors[formattingName]
					: this.colors.propertyValue),
				seperatorString,
				primitives.getTerminalWidth() - 2 * this.indentation.length - seperatorString.length - keySize
			)
			.split('\n')
			.map((line, i, lines) => (i === 0
					? keyString
					: primitives.fillString(keySize + this.indentation.length + 1)
				) + line)
			.join('\n'));
	}

	properties (obj, formattingName) {
		let maxLength = 0;
		if(Array.isArray(obj)) {
			obj.forEach((k) => {
				maxLength = Math.max((k[0] || '').length, maxLength);
			});
			obj.forEach(k => {
				this.property(k[0], k[1], maxLength, k[2] || formattingName);
			});
		} else {
			Object.keys(obj).forEach(k => {
				maxLength = Math.max(k.length, maxLength);
			});
			Object.keys(obj).forEach(k => {
				this.property(k, obj[k], maxLength, formattingName);
			});
		}
	}

	break () {
		return this[LOG]('', false, '');
	}

	destroyAllSpinners (message) {
		this[DESTROYERS].forEach(fn => fn());
	}

	spinner (message, colorSpinning, colorDone) {
		colorSpinning = colorSpinning || 'spinnerSpinning';
		colorDone = colorDone || 'spinnerDone';
		let hasClearLine = typeof process.stdout.clearLine === 'function',
			startTime = new Date().getTime(),
			formatter = this.spinnerFactory(message).bind(this),
			interval = hasClearLine
				? setInterval(() => {
					process.stdout.clearLine();
					process.stdout.cursorTo(0);

					this[LOG](formatter(), this.colors[colorSpinning], this.indentation, true);
				}, this.spinnerInterval)
				: null,
			destroySpinner = () => {
				let ms = new Date().getTime() - startTime;

				if (hasClearLine) {
					process.stdout.clearLine();
					process.stdout.cursorTo(0);
				}

				this[LOG](`${message} (${ms})`, this.colors[colorDone], this.indentation);

				clearInterval(interval);
				this[DESTROYERS].splice(this[DESTROYERS].indexOf(destroySpinner), 1);
			};

		this[DESTROYERS].push(destroySpinner);

		if (hasClearLine)
			this[LOG](formatter(), this.colors[colorSpinning], this.indentation, true);

		return destroySpinner;
	}

	table (columnNames, content, expanded) {
		const columnSizes = [],
			totalWidth = Math.min(primitives.getTerminalWidth() - 2 * this.indentation.length, 800) || 800,
			columnSeperator = '  ';

		content = content.map(row => row.map((cell, colIndex) => {
			if(!columnSizes[colIndex])
				columnSizes[colIndex] = 0;

			if(cell.length > columnSizes[colIndex])
				columnSizes[colIndex] = cell.length;

			return cell.trim();
		}));

		const totalContentAvailableWidth = totalWidth - (columnNames.length) * columnSeperator.length;
		const totalContentNativeWidth = columnSizes.reduce((total, size) => total + size, 0);

		const contentRelativeSizes = totalContentNativeWidth <= totalContentAvailableWidth
			? columnSizes.map(size => size)
			: columnSizes.map((size, i) => Math.ceil(totalContentAvailableWidth * (size/totalContentNativeWidth)));

		let table = new Table({
			head: columnNames || [],
			colWidths: contentRelativeSizes,
			chars: !expanded ? tableChars.compact : tableChars.expanded,
			style: {
				'padding-left': 0,
				'padding-right': 0,
				compact: !expanded,
				head: this.colors.tableHeader || [],
				border: this.colors.debug || []
			}
		});

		content.forEach(cont => table.push(cont.map((c, i) => {
			return c.length > contentRelativeSizes[i]
				? primitives.wrap(c, contentRelativeSizes[i])
				: c
		})));

		console.log(table.toString().split(os.EOL).map(line => this.indentation + line).join(os.EOL));
	}
}


module.exports = Response;
