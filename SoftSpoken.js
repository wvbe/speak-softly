'use strict';

const os = require('os'),
	util = require('util'),

	Table = require('cli-table'),

	primitives = require('./primitives'),
	extras = require('./extras'),

	DEFAULT_CONFIG = {
		indentation: '    ',
		tableCharacters: extras.expandedTable,
		spinnerFactory: extras.spriteSpinner,
		spinnerInterval: 200
	},

	LOG = Symbol(),
	DESTROYERS = Symbol();

class Response {
	/**
	 *
	 * @param {Object} [colors]
	 * @param {Object} [config]
	 */
	constructor (colors, config) {
		this.colors = Object.assign({}, extras.defaultTheme, colors);

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

		if (this.needsClearing && typeof process.stdout.clearLine === 'function') {
			process.stdout.clearLine();
			process.stdout.cursorTo(0);
			this.needsClearing = false;
		}

		process.stdout.write(primitives.indentString(primitives.formatString(string, formattingOptions), indentation) + (skipLineBreak ? '' : os.EOL));
	}

	/**
	 * A description of proceedings relevant to the task/whatever
	 * @param data
	 */
	log (data) {
		this[LOG](data, this.colors.log, this.indentation);
	}

	/**
	 * Indicates that something the user wanted happened.
	 * @param data
	 */
	success (data) {
		this[LOG](data, this.colors.success, this.indentation);
	}

	/**
	 * Indicates the app is working on a concern/task/whatever.
	 * @param data
	 */
	caption (data) {
		console.log('');
		this[LOG](data, this.colors.caption,this.indentation);
	}

	/**
	 * Something that is probably of interest (but not neccessarily bad), if not important, for the user; exceptions, search results, urgent stuff
	 * @param data
	 */
	notice (data) {
		this[LOG](data, this.colors.notice, this.indentation);
	}

	/**
	 * Something messed up
	 * @param data
	 */
	error (data) {
		this[LOG](data, this.colors.error, this.indentation);
	}

	/**
	 * Information that the user might not even care about at that time
	 * @param data
	 */
	debug (data) {
		this[LOG]((data && typeof data === 'object')
			? util.inspect(data, {depth: 3, colors: false})
			: data, this.colors.debug, this.indentation);
	}

	property (key, value, keySize, formattingName) {
		keySize = keySize || 0;
		const keyString = primitives.indentString(
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

	/**
	 * Whenever you need a little peace & quiet in your life, use break()
	 * @returns {*}
	 */
	break () {
		this[LOG]('', false, '');
	}

	/**
	 * Stop and remove any remaining spinners
	 */
	destroyAllSpinners () {
		this[DESTROYERS].forEach(fn => fn());
	}

	/**
	 * Nice little ASCII animation that runs while the destroyer is not called.
	 * @param message
	 * @returns {function} The destroyer
	 */
	spinner (message) {
		const hasClearLine = typeof process.stdout.clearLine === 'function',
			startTime = new Date().getTime(),
			formatter = this.spinnerFactory(this, message),
			interval = hasClearLine
				? setInterval(() => {
						process.stdout.clearLine();
						process.stdout.cursorTo(0);

						this[LOG](formatter(), this.colors.spinnerSpinning, this.indentation, true);
						this.needsClearing = true;
					}, this.spinnerInterval)
				: null,
			destroySpinner = () => {
				const ms = new Date().getTime() - startTime;

				if (hasClearLine) {
					process.stdout.clearLine();
					process.stdout.cursorTo(0);
				}

				this[LOG](`${message} (${ms}ms)`, this.colors.spinnerDone, this.indentation);

				clearInterval(interval);
				this[DESTROYERS].splice(this[DESTROYERS].indexOf(destroySpinner), 1);
			};

		this[DESTROYERS].push(destroySpinner);

		if (hasClearLine) {
			this[LOG](formatter(), this.colors.spinnerSpinning, this.indentation, true);
			this.needsClearing = true;
		}

		return destroySpinner;
	}

	table (columnNames, content, expanded) {
		const columnSizes = [],
			totalWidth = Math.min(primitives.getTerminalWidth() - 2 * this.indentation.length, 800) || 800,
			columnSeperator = '  ';

		content = content.map(row => row.map((cell, colIndex) => {
			cell = cell + '';
			if(!columnSizes[colIndex])
				columnSizes[colIndex] = columnNames[colIndex].length;

			if(cell.length > columnSizes[colIndex])
				columnSizes[colIndex] = cell.length;

			return cell.trim();
		}));

		const totalContentAvailableWidth = totalWidth - (columnNames.length) * columnSeperator.length,
			totalContentNativeWidth = columnSizes.reduce((total, size) => total + size, 0),
			contentRelativeSizes = totalContentNativeWidth <= totalContentAvailableWidth
				? columnSizes
				: columnSizes.map((size, i) => Math.ceil(totalContentAvailableWidth * (size/totalContentNativeWidth))),
			table = new Table({
				head: columnNames || [],
				colWidths: contentRelativeSizes,
				chars: !expanded ? extras.compactTable : this.tableCharacters,
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

		table.toString().split(os.EOL).map(line => this.indentation + line).forEach(line => {
			console.log(line);
		});
	}
}


module.exports = Response;
