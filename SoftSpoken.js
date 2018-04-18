'use strict';

const os = require('os');
const util = require('util');

const Table = require('cli-table');

const primitives = require('./primitives');
const extras = require('./extras');

const DEFAULT_CONFIG = {
	defaultWidth: extras.defaultWidth,
	indentation: '    ',
	defaultIndentation: 1,
	tableCharacters: extras.expandedTable,
	spinnerFactory: extras.spriteSpinner,
	spinnerInterval: 200,
	stdout: process.stdout
};

const LOG = Symbol();
const WIDTH = Symbol();
const DESTROYERS = Symbol();

function getLeftIndentationString (indentation, indentationLevel) {
	let str = '';
	for(let i = 0; i < indentationLevel; ++i) {
		str += indentation;
	}
	return str;
}

class SpeakSoftly {

	/**
	 *
	 * @param {Object} [colors]
	 * @param {Object} [config]
	 */
	constructor (colors, config) {
		// Write the color config to instance, and convert values to arrays if they weren't already
		this.colors = Object.assign({}, extras.defaultTheme, colors);
		Object.keys(this.colors).forEach(name => {
			if (!this.colors[name])
				this.colors[name] = ['dim'];
			else if (!Array.isArray(this.colors[name]))
				this.colors[name] = [this.colors[name]];
		});

		// Write all other config to instance
		this.config = Object.assign({}, DEFAULT_CONFIG, config);

		// If set to TRUE, the next log will overwrite the previous output
		this.needsClearing = false;

		// The number of indents the next log will have
		this.indentationLevel = this.config.defaultIndentation;

		// The maximum width of any line logged by SpeakSoftly
		this[WIDTH] = primitives.getTerminalWidth() || this.config.defaultWidth;

		// A list of interval destroyers
		this[DESTROYERS] = [];
	}

	[LOG] (string, formattingOptions, skipLineBreak) {
		if (this.needsClearing && typeof this.config.stdout.clearLine === 'function') {
			this.config.stdout.clearLine();
			this.config.stdout.cursorTo(0);
			this.needsClearing = false;
		}


		this.config.stdout.write(primitives.indentString(
			primitives.formatString(string, formattingOptions),
			getLeftIndentationString(this.config.indentation, this.indentationLevel),
			this.config.indentation,
			this[WIDTH]) + (skipLineBreak ? '' : os.EOL));
	}

	setWrapping (width) {
		if(width === true)
			this[WIDTH] = primitives.getTerminalWidth();
		else if(width)
			this[WIDTH] = parseInt(width);
		else
			this[WIDTH] = Infinity;
	}

	indent () {
		++this.indentationLevel;
	}
	outdent () {
		this.indentationLevel = Math.max(this.config.defaultIndentation, this.indentationLevel - 1);
	}

	/**
	 * A description of proceedings relevant to the task/whatever
	 * @param data
	 */
	log (data, color) {
		this[LOG](data, this.colors.log);
	}

	/**
	 * Indicates that something the user wanted happened.
	 * @param data
	 */
	success (data) {
		this[LOG](data, this.colors.success);
	}

	/**
	 * Indicates the app is working on a concern/task/whatever.
	 * @param data
	 */
	caption (data) {
		this.config.stdout.write(os.EOL);
		this[LOG](data, this.colors.caption);
	}

	/**
	 * Something that is probably of interest (but not neccessarily bad), if not important, for the user; exceptions, search results, urgent stuff
	 * @param data
	 */
	notice (data) {
		this[LOG](data, this.colors.notice);
	}

	/**
	 * Something messed up
	 * @param data
	 */
	error (data) {
		this[LOG](data, this.colors.error);
	}

	/**
	 * Information that the user might not even care about at that time
	 * @param data
	 */
	debug (data) {
		this[LOG]((data && typeof data === 'object')
			? util.inspect(data, {depth: 3, colors: false})
			: data, this.colors.debug);
	}

	definition (key, value, formattingName) {
		this[LOG](key, this.colors.definitionKey);

		this.config.stdout.write(primitives.indentString(
				primitives.formatString(value, formattingName
					? this.colors[formattingName]
					: this.colors.definitionValue),
				getLeftIndentationString(this.config.indentation, this.indentationLevel + 1),
				this.config.indentation,
				this[WIDTH]) + os.EOL);
	}

	property (key, value, keySize, formattingName) {
		keySize = keySize || 0;
		const keyString = primitives.indentString(
				primitives.formatString(primitives.padString(key, keySize), this.colors.propertyKey),
				getLeftIndentationString(this.config.indentation, this.indentationLevel),
				this.config.indentation,
				this[WIDTH]
			),
			seperatorString = ''; // used to pad the value of a property

		this.config.stdout.write(primitives.indentString(
				primitives.formatString(value, formattingName
					? this.colors[formattingName]
					: this.colors.propertyValue),
				seperatorString,
				seperatorString,
				this[WIDTH] - (1 + this.indentationLevel) * this.config.indentation.length - seperatorString.length - keySize
			)
			.split('\n')
			.map((line, i, lines) => (i === 0
					? keyString
					: primitives.fillString(keySize + (this.indentationLevel + 1) * this.config.indentation.length + 1)
				) + line)
			.join('\n') + os.EOL);
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
		this[LOG]('', false);
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
		const hasClearLine = typeof this.config.stdout.clearLine === 'function',
			startTime = new Date().getTime(),
			formatter = this.config.spinnerFactory(this, message),
			interval = hasClearLine
				? setInterval(() => {
						this.config.stdout.clearLine();
						this.config.stdout.cursorTo(0);

						this[LOG](formatter(), this.colors.spinnerSpinning, true);
						this.needsClearing = true;
					}, this.config.spinnerInterval)
				: null,
			destroySpinner = () => {
				const ms = new Date().getTime() - startTime;

				if (hasClearLine) {
					this.config.stdout.clearLine();
					this.config.stdout.cursorTo(0);
				}

				this[LOG](`${message} (${ms}ms)`, this.colors.spinnerDone);

				clearInterval(interval);
				this[DESTROYERS].splice(this[DESTROYERS].indexOf(destroySpinner), 1);
			};

		this[DESTROYERS].push(destroySpinner);

		if (hasClearLine) {
			this[LOG](formatter(), this.colors.spinnerSpinning, true);
			this.needsClearing = true;
		}

		return destroySpinner;
	}

	table (columnNames, content, expanded) {
		const columnSizes = [],
			totalWidth = Math.min(this[WIDTH] - (this.indentationLevel + 1) * this.config.indentation.length, 800),
			columnSeperator = '  ';

		content = content.map(row => row.map((cell, colIndex) => {
			cell = cell + '';
			if(!columnSizes[colIndex])
				columnSizes[colIndex] = columnNames[colIndex].length;

			let cellLength = cell.length;
			if(cell.includes('\n'))
				cellLength = cell.split('\n').reduce((a, b) => a.length > b.length ? a : b).length;
			if(cellLength > columnSizes[colIndex])
				columnSizes[colIndex] = cellLength;

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
				chars: !expanded ? extras.compactTable : this.config.tableCharacters,
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

		table.toString()
			.split('\n')
			.map(line => getLeftIndentationString(this.config.indentation, this.indentationLevel) + line)
			.forEach(line => {
				this.config.stdout.write(line + os.EOL);
			});
	}

	list (listItems, bulletCharacter) {
		listItems.forEach((listItem, i) => {
			this.listItem(listItem, bulletCharacter ? bulletCharacter : ((i + 1) + '.'));
		});
	}

	listItem (value, bulletCharacter) {
		this.config.stdout.write(
			primitives.indentString(
				primitives.formatString(bulletCharacter, this.colors.listItemBullet)
				+ ' '
				+ primitives.formatString(value, this.colors.listItemValue), this.config.indentation
			) + os.EOL);
	}

}


module.exports = SpeakSoftly;
