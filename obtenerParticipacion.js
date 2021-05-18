'use strict';
const axios = require("axios");
const fs = require('fs');
const path = require('path');
const computoParticipacionPorLocalURL = "https://www.servelelecciones.cl/data/participacion/computo/locales/";

let f = fs.readFileSync('indice_mesas.json');
let current = JSON.parse(f);

const getData = async url => {
  try {
      const response = await axios.get(url);
      const data = response.data;
      return data;
      //console.log(data);
  } catch (error) {
      console.log(error);
      return null;
  }
};

var salida=[];

async function GetParticipacion(){
    try{
	var ultimoLocal;
	for (var i=0;i<current.length;++i){
	    if(ultimoLocal==current[i].C_LOCAL)
		continue;
	    ultimoLocal=current[i].C_LOCAL;
	    console.log("SACANDO : "+current[i].COMUNA + " -- "+current[i].LOCAL);
	    const computos = await getData(computoParticipacionPorLocalURL+current[i].C_LOCAL+".json");
	    if(computos!=null){
		var num=0;
		var noms=[];
		var keys=[];
		for (var key of Object.keys(computos.title)) {
		    keys.push(key);
		    noms.push(computos.title[key]);
		    num++;
		}
		for (var j=0;j<computos.data.length;++j){
		    var datoActual={'COMUNA':current[i].COMUNA,'CIRC_ELEC':current[i].CIRC_ELEC,'LOCAL':current[i].LOCAL};
		    for(var k=0;k<num;++k){
			datoActual[noms[k]]=computos.data[j][keys[k]];
		    }
		    salida.push(datoActual);
		}
		if(salida.length%100==0){
		    fs.writeFileSync('salida_participacion.json', JSON.stringify(salida));
		}
	    }
	}
	const createCsvWriter = require('csv-writer').createObjectCsvWriter;
	var header=[];
	if(salida.length>0){
	    for (var key of Object.keys(salida[0])) {
		header.push({id:key,title:key});
	    }
	    const csvWriterCurrent = createCsvWriter({
		path: 'salida_participacion.csv',
		header: header
	    });
	    csvWriterCurrent.writeRecords(salida)       // returns a promise
		.then(() => {
		    console.log('...Done');
		});
	}
    }catch(error){
	console.log(error);
    }
    fs.writeFileSync('salida_participacion.json', JSON.stringify(salida));
}

GetParticipacion();

