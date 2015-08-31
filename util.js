var os = require('os'),
	wordwrap = require('word-wrap'),
	chalk = require('chalk'),
	Promise = require('promise');


function indentString(string, indentation) {
	if(indentation === undefined)
		indentation = '    ';

	var lineWidth = getTerminalWidth() - 2 * indentation.length;

	return wordwrap(string, {
		indent: '',
		width: lineWidth,
		cut: lineWidth/3,
		newline: os.EOL
	})
		.split(os.EOL)
		.map(function (line) {
			return indentation + line;
		})
		.join(os.EOL);
}

function fill (length, char) {
	return (new Array(length).join(char || ' '));
}

function padString ( str, length, char ) {
	return str + fill(Math.max((length || 0) - (str.length || 0) + 1, 0), char || ' ');
}

function formatString(string, formatting) {
	if(!formatting)
		return string;
	return (formatting).reduce(function (c, formattingOption) {
		return c[formattingOption];
	}, chalk)(string);
}

function getTerminalWidth () {
	return process.stdout.columns;
}

module.exports = {
	formatString: formatString,
	indentString: indentString,
	padString: padString,
	getTerminalWidth: getTerminalWidth
};