'use strict';

const SpeakSoftly = require('./SoftSpoken');

const softSpoken = new SpeakSoftly(
		{
			notice: 'yellow',
			error: ['white', 'bgRed'],
			spinnerDone: ['bold', 'white']
		},
		{
			spinnerInterval: 50,
			spinnerFactory: require('./extras').dotSpinner
		}
	);

softSpoken.caption('This is header text');
softSpoken.indent();
softSpoken.log('Indent +1');
softSpoken.log('This is regular log text. It should wrap well, regardless of indentation. This is regular log text. It should wrap well, regardless of indentation. This is regular log text. It should wrap well, regardless of indentation.');

softSpoken.debug('This is some debug information');

softSpoken.indent();

softSpoken.log('Indent +1');

softSpoken.notice('This is a notice');

softSpoken.success('This is a success');

softSpoken.error(new Error('This is an error'));

softSpoken.properties({
	'Key': 'Value',
	'foo': 'bar'
});

softSpoken.outdent();
softSpoken.log('Outdent');

softSpoken.properties([
	['Non-unique key', 'Value 1. Should also wrap, regardless out indentation. Should also wrap, regardless out indentation. Should also wrap, regardless out indentation.'],
	['Non-unique key', 'Value 2']
]);

softSpoken.outdent();
softSpoken.log('Outdent');
softSpoken.outdent();
softSpoken.log('Outdent');
softSpoken.indent();
softSpoken.log('Indent +1');
softSpoken.table(
	'One,Two,Three'.split(','),
	[
		[0, 'Twee', 'Drie'],
		[1, null, 'Drie'],
		[2, 'Twee'],
		[3, { whut: true }, ['D', 'r', 'i', 'e']],
		[
			4,
			'Lets get some wrapping text up in this mofo! Lets get some wrapping text up in this mofo! Lets get some wrapping text up in this mofo!',
			'This is a whole nutha story! This is a whole nutha story! This is a whole nutha story! This is a whole nutha story! This is a whole nutha story!'
		]
	]);
softSpoken.definition('derp', 'A word commonly said by wvbe');
softSpoken.outdent();
softSpoken.log('Outdent');
softSpoken.definition('nerf', 'A word also commonly said by wvbe');
setTimeout(softSpoken.spinner('Spinnermesome'), 1000);
