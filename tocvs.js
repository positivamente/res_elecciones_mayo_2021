const fs = require('fs');
const path = require('path');
let f = fs.readFileSync(process.argv[2]);
let current = JSON.parse(f);

const createCsvWriter = require('csv-writer').createObjectCsvWriter;
var header=[];
for (var key of Object.keys(current[0])) {
    header.push({id:key,title:key});
}
const csvWriterCurrent = createCsvWriter({
    path: process.argv[3],
    header: header
});
csvWriterCurrent.writeRecords(current)       // returns a promise
    .then(() => {
	console.log('...Done');
    });
