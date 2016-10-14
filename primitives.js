const os = require('os');
const wrapAnsi = require('wrap-ansi');
const chalk = require('chalk');

function wrap (str, width) {
	return wrapAnsi(str, width, { hard: true });
}

function indentString(string, indentationLeft, indentationRight, screenWidth) {
	if(indentationLeft === undefined)
		indentationLeft = '    ';

	if(indentationRight === undefined)
		indentationRight = indentationLeft;

	if(screenWidth === Infinity)
		return indentationLeft + string + indentationRight;

	if(!screenWidth)
		screenWidth = getTerminalWidth();

	return string.split(os.EOL)
		.map(string => wrap(string, screenWidth - indentationLeft.length - indentationRight.length)
			.split(os.EOL)
			.map(function (line) {
				return indentationLeft + line + indentationRight;
			})
			.join(os.EOL)
		)
		.join(os.EOL);
}

function fillString (length, char) {
	return (new Array(length).join(char || ' '));
}

function padString (str, length, char) {
	return str + fillString(Math.max((length || 0) - (str.length || 0) + 1, 0), char || ' ');
}

function formatString(string, formatting) {
	if(!formatting)
		return string;

	return formatting.reduce((c, formattingOption) => c[formattingOption], chalk)(string);
}

function getTerminalWidth () {
	return process.stdout.columns;
}

module.exports = {
	wrap: wrap,
	formatString: formatString,
	indentString: indentString,
	padString: padString,
	fillString: fillString,
	getTerminalWidth: getTerminalWidth
};
