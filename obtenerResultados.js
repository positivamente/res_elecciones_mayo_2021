'use strict';
const axios = require("axios");
const fs = require('fs');
const path = require('path');
const computoGobernacionPorMesaURL = "https://www.servelelecciones.cl/data/elecciones_gobernadores/computomesas/";
const computoConstituyentePorMesaURL = "https://www.servelelecciones.cl/data/elecciones_convencionales_g/computomesas/";
const computoAlcaldiaPorMesaURL = "https://www.servelelecciones.cl/data/elecciones_alcaldes/computomesas/";
const computoConcejalPorMesaURL = "https://www.servelelecciones.cl/data/elecciones_concejales/computomesas/";

/////////MODIFICAR ESTO:
const cual = computoGobernacionPorMesaURL; // ACÁ PONER CUAL
const archivo_salida = 'gobernacion_por_mesa'; // ACÁ NOMBRE SE ARCHIVOS DE SALIDA
let f = fs.readFileSync('indice_mesas.json');// ACÁ ARCHIVO ENTRADA (VIENE DE obtenerIndice.js)
////////////////////////////////////////////////////////////////////////////////////

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

var salida=fs.existsSync(archivo_salida+".json")?JSON.parse(fs.readFileSync(archivo_salida+".json")):[];

var llegamosHastaUltimo=true;
var ultimaMesa="";
var ultimaComuna="";
var ultimoLocal="";
if(salida.length>0){
    llegamosHastaUltimo=false;
    ultimaMesa=salida[salida.length-1]['MESA'];
    ultimaComuna=salida[salida.length-1]['COMUNA'];
    ultimoLocal=salida[salida.length-1]['LOCAL'];
}

async function GetComputosPorMesa(){
    try{
	for (var i=0;i<current.length;++i){
	    if(!llegamosHastaUltimo){
		if(current[i].COMUNA==ultimaComuna && current[i].MESA==ultimaMesa && current[i].LOCAL==ultimoLocal){
		    llegamosHastaUltimo=true;
		    console.log("ULTIMO : "+current[i].COMUNA + " -- "+current[i].LOCAL + " -- "+current[i].MESA);
		}
		continue;
	    }
	    console.log(i+"/"+current.length+" SACANDO : "+current[i].COMUNA + " -- "+current[i].LOCAL + " -- "+current[i].MESA);
	    const computos = await getData(cual+current[i].C_MESA+".json");
	    if(computos!=null){
		for (var j=0;j<computos.data.length;++j){
		    for(var l=0;l<computos.data[j]['sd'].length;++l){
			var datoCandidatura={'COMUNA':current[i].COMUNA,'CIRC_ELEC':current[i].CIRC_ELEC,'LOCAL':current[i].LOCAL,'MESA':current[i].MESA};
			datoCandidatura['LISTA']=computos.data[j]['a'];
			datoCandidatura['CANDIDATX']=computos.data[j]['sd'][l]['a'];
			datoCandidatura['PARTIDO']=computos.data[j]['sd'][l]['b'];
			datoCandidatura['VOTOS']=computos.data[j]['sd'][l]['c'];
			datoCandidatura['ELECTX']=computos.data[j]['sd'][l]['f']!='';
			salida.push(datoCandidatura);
		    }
		}
		if(salida.length%100==0){
		    fs.writeFileSync(archivo_salida+'.json', JSON.stringify(salida));
		}
	    }else{
		console.log("ERROR");
		break;
	    }
	}
	const createCsvWriter = require('csv-writer').createObjectCsvWriter;
	var header=[];
	if(salida.length>0){
	    for (var key of Object.keys(salida[0])) {
		header.push({id:key,title:key});
	    }
	    const csvWriterCurrent = createCsvWriter({
		path: archivo_salida+'.csv',
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
    fs.writeFileSync(archivo_salida+'.json', JSON.stringify(salida));
}

GetComputosPorMesa();
