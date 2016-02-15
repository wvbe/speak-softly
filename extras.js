'use strict';

const primitives = require('./primitives');

module.exports = {
	defaultTheme: {
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

	dotSpinner: function dotSpinnerFactory (softSpoken, message) {
		let l = (primitives.getTerminalWidth() - 2 * softSpoken.indentation.length - message.length),
			i = 0;

		return function () {
			return message + new Array(++i % l).join('.');
		}
	},

	spriteSpinner: function spriteSpinnerFactory (softSpoken, message) {
		let chars = '▖▘▝▗'.split(''),
			i = 0;

		return function () {
			return message + ' ' + chars[(++i - 1) % chars.length];
		}
	}
};