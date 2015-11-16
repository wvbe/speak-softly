'use strict';

let SpeakSoftly = require('./SoftSpoken'),
	softSpoken = new SpeakSoftly(
		{
			notice: 'yellow',
			error: ['white', 'bgRed'],
			spinnerDone: ['bold', 'white']
		},
		{
			spinnerInterval: 100
		}
	);

softSpoken.caption('This is header text');

softSpoken.log('This is regular log text');

softSpoken.debug('This is some debug information');

softSpoken.notice('This is a notice');

softSpoken.success('This is a success');

softSpoken.error(new Error('This is an error'));

softSpoken.properties({
	'Key': 'Value',
	'foo': 'bar'
});

softSpoken.properties([
	['Non-unique key', 'Value 1'],
	['Non-unique key', 'Value 2']
]);

setTimeout(softSpoken.spinner('This is a spinner').bind(softSpoken), 1000);