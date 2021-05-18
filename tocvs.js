const fs = require('fs');
const path = require('path');
let f = fs.readFileSync('indice_mesas2.json');
let current = JSON.parse(f);

const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriterCurrent = createCsvWriter({
    path: 'salida_indice2.csv',
    header: [
	{id: 'COMUNA', title: 'COMUNA'},
	{id: 'C_COMUNA', title: 'COD. COMUNA'},
	{id: 'CIRC_ELEC', title: 'CIRC. ELECT.'},
	{id: 'C_CIRC_ELEC', title: 'COD. CIRC. ELECT.'},
	{id: 'LOCAL', title: 'LOCAL'},
	{id: 'C_LOCAL', title: 'COD. LOCAL'},
	{id: 'MESA', title: 'MESA'},
	{id: 'C_MESA', title: 'COD. MESA'}
    ]
});
csvWriterCurrent.writeRecords(current)       // returns a promise
    .then(() => {
	console.log('...Done');
    });
