# SPEAK-SOFTLY
Some fn's to log yo shit to console. Colors 'n stuff.

## The geste
```
var SpeakSoftly = require('speak-softly'),
	softSpoken = new SpeakSoftly({
		log: 'white',
		notice: 'yellow',
		error: ['white', 'bgRed']
	});

softSpoken.caption('Dumping bunny intel');
softSpoken.properties(bunny);
softSpoken.log('End of bunny');
```

- __Methods:__ log, notice, error, debug, caption, success, property, properties
- __Options:__ log, notice, error, debug, caption, success, propertyKey, propertyValue
- __Values:__ Zero, one or two `chalk` colors; reset, bold, dim, italic, underline, inverse, hidden, strikethrough, black, red, green, yellow, blue, magenta, cyan, white, gray, grey, bgBlack, bgRed, bgGreen, bgYellow, bgBlue, bgMagenta, bgCyan, bgWhite

## License
Copyright (c) 2015 Wybe Minnebo

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

__THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.__