'use strict';

const os = require('os');

const stripAnsi = require('strip-ansi');

const primitives = require('./primitives');

module.exports = {
	defaultWidth: 200,
	defaultTheme: {
		log: ['reset'],
		success: ['bold'],
		caption: ['underline'],
		notice: ['yellow'],
		error: ['red'],
		debug: ['dim'],
		propertyKey: ['dim'],
		propertyValue: ['reset'],
		definitionKey: ['reset'],
		definitionValue: ['dim'],
		tableHeader: ['dim'],
		spinnerSpinning: ['dim'],
		spinnerDone: ['dim'],
		listItemBullet: ['dim'],
		listItemValue: ['reset']
	},

	compactTable: {
		'top': '', 'top-mid': '', 'top-left': '', 'top-right': ''
		, 'bottom': '', 'bottom-mid': '', 'bottom-left': '', 'bottom-right': ''
		, 'left': '', 'left-mid': '', 'mid': '', 'mid-mid': ''
		, 'right': '', 'right-mid': '', 'middle': '  '
	},

	expandedTable: {
		'top': '', 'top-mid': '', 'top-left': '', 'top-right': ''
		, 'bottom': '', 'bottom-mid': '', 'bottom-left': '', 'bottom-right': ''
		, 'left': '', 'left-mid': '', 'mid': '─', 'mid-mid': '──'
		, 'right': '', 'right-mid': '', 'middle': '  '
	},

	originalTable: {
		'top': '═', 'top-mid': '╤', 'top-left': '╔', 'top-right': '╗'
		, 'bottom': '═', 'bottom-mid': '╧', 'bottom-left': '╚', 'bottom-right': '╝'
		, 'left': '║', 'left-mid': '╟', 'mid': '─', 'mid-mid': '┼'
		, 'right': '║', 'right-mid': '╢', 'middle': '│'
	},

	dotSpinner: function dotSpinnerFactory (softSpoken, _message, formattedMessageWithoutAnsi, _formattedMessageWithAnsi) {
		const configuredStdout = softSpoken.config.stdout,
			lines = formattedMessageWithoutAnsi.split(os.EOL);

		let lastLineLength = lines[lines.length - 1].length,
			l = softSpoken.getWidth() - lastLineLength - softSpoken.config.indentation.length,
			i = l + 1,
			isOnNewLine = false;

		return function (doneMessage, isCleared) {
			if (doneMessage) {
				configuredStdout.cursorTo(lastLineLength);
				configuredStdout.clearLine(1);

				if (doneMessage.length > l) {
					// If the done message does not fit on the current line, output on a new line and indent properly.
					configuredStdout.write(os.EOL);
					configuredStdout.write(primitives.indentString(
						primitives.formatString(doneMessage, softSpoken.colors.spinnerDone),
						primitives.getLeftIndentationString(softSpoken.config.indentation, softSpoken.indentationLevel),
						softSpoken.config.indentation,
						softSpoken.getWidth()));
				} else {
					configuredStdout.write(primitives.formatString((isOnNewLine ? '' : ' ') + doneMessage, softSpoken.colors.spinnerDone));
				}

				return;
			}

			if (++i > l || isCleared) {
				i = 0;

				if (l < 2 || (isCleared && isOnNewLine)) {
					// If the spinner does not fit on the current line, output on a new line and indent properly.
					const indent = primitives.getLeftIndentationString(softSpoken.config.indentation, softSpoken.indentationLevel);
					configuredStdout.write(os.EOL);
					configuredStdout.write(indent);
					isOnNewLine = true;
					l = softSpoken.getWidth() - (softSpoken.config.indentation.length * (softSpoken.indentationLevel + 1));
					lastLineLength = indent.length;
				} else {
					configuredStdout.cursorTo(lastLineLength);
					configuredStdout.clearLine(1);
				}
			}

			configuredStdout.write(primitives.formatString('.', softSpoken.colors.spinnerSpinning));
		};
	},

	spriteSpinner: function spriteSpinnerFactory (softSpoken, _message, formattedMessageWithoutAnsi, _formattedMessageWithAnsi) {
		const chars = '▖▘▝▗'.split(''),
			configuredStdout = softSpoken.config.stdout,
			lines = formattedMessageWithoutAnsi.split(os.EOL);

		let lastLineLength = lines[lines.length - 1].length,
			l = softSpoken.getWidth() - lastLineLength - softSpoken.config.indentation.length,
			i = 0,
			isOnNewLine = false;

		return function (doneMessage, isCleared) {
			if (doneMessage) {
				configuredStdout.cursorTo(lastLineLength);
				configuredStdout.clearLine(1);

				if (doneMessage.length > l) {
					// If the done message does not fit on the current line, output on a new line and indent properly.
					configuredStdout.write(os.EOL);
					configuredStdout.write(primitives.indentString(
						primitives.formatString(doneMessage, softSpoken.colors.spinnerDone),
						primitives.getLeftIndentationString(softSpoken.config.indentation, softSpoken.indentationLevel),
						softSpoken.config.indentation,
						softSpoken.getWidth()));
				} else {
					configuredStdout.write(primitives.formatString((isOnNewLine ? '' : ' ') + doneMessage, softSpoken.colors.spinnerDone));
				}

				return;
			}

			if (l < 2 || (isCleared && isOnNewLine)) {
				// If the spinner does not fit on the current line, output on a new line and indent properly.
				const indent = primitives.getLeftIndentationString(softSpoken.config.indentation, softSpoken.indentationLevel);
				configuredStdout.write(os.EOL);
				configuredStdout.write(indent);
				isOnNewLine = true;
				l = softSpoken.getWidth() - (softSpoken.config.indentation.length * (softSpoken.indentationLevel + 1));
				lastLineLength = indent.length;
			}

			configuredStdout.cursorTo(lastLineLength);
			configuredStdout.clearLine(1);
			configuredStdout.write((isOnNewLine ? '' : ' ') + primitives.formatString(chars[(++i - 1) % chars.length], softSpoken.colors.spinnerSpinning));
		}
	}
};
