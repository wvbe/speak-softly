var os = require('os'),
	wrapAnsi = require('wrap-ansi'),
	chalk = require('chalk');

function wrap (str, width) {
	return wrapAnsi(str, width, { hard: true });
}

function indentString(string, indentation, screenWidth) {
	if(indentation === undefined)
		indentation = '    ';

	if(!screenWidth)
		screenWidth = getTerminalWidth();

	var lineWidth = screenWidth - 2 * indentation.length;

	return string.split(os.EOL)
		.map(string => wrap(string, lineWidth)
			.split(os.EOL)
			.map(function (line) {
				return indentation + line;
			})
			.join(os.EOL))
		.join(os.EOL);
}

function fillString (length, char) {
	return (new Array(length).join(char || ' '));
}

function padString ( str, length, char ) {
	return str + fillString(Math.max((length || 0) - (str.length || 0) + 1, 0), char || ' ');
}

function formatString(string, formatting) {
	if(!formatting)
		return string;
	return (formatting || []).reduce(function (c, formattingOption) {
		return c[formattingOption];
	}, chalk)(string);
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
