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
const numMesasSimultaneas = 8;
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

var desdeCualPartimos=0;
for (var i=0;i<current.length;++i){
	desdeCualPartimos=i;
	if(!llegamosHastaUltimo){
		if(current[i].COMUNA==ultimaComuna && current[i].MESA==ultimaMesa && current[i].LOCAL==ultimoLocal){
		    llegamosHastaUltimo=true;
		    console.log("ULTIMO : "+current[i].COMUNA + " -- "+current[i].LOCAL + " -- "+current[i].MESA);
		}
		continue;
	}else{
		break;
	}
}

async function GetComputosPorMesa(fila){
	var salidaLocal=[];
	try{
	    console.log("SACANDO : "+current[fila].COMUNA + " -- "+current[fila].LOCAL + " -- "+current[fila].MESA);
	    const computos = await getData(cual+current[fila].C_MESA+".json");
	    if(computos!=null){
		for (var j=0;j<computos.data.length;++j){
		    for(var l=0;l<computos.data[j]['sd'].length;++l){
			var datoCandidatura={'COMUNA':current[fila].COMUNA,'CIRC_ELEC':current[fila].CIRC_ELEC,'LOCAL':current[fila].LOCAL,'MESA':current[fila].MESA};
			datoCandidatura['LISTA']=computos.data[j]['a'];
			datoCandidatura['CANDIDATX']=computos.data[j]['sd'][l]['a'];
			datoCandidatura['PARTIDO']=computos.data[j]['sd'][l]['b'];
			datoCandidatura['VOTOS']=computos.data[j]['sd'][l]['c'];
			datoCandidatura['ELECTX']=computos.data[j]['sd'][l]['f']!='';
			salidaLocal.push(datoCandidatura);
		    }
		}
		return salidaLocal;
	    }else{
		console.log("ERROR");
		return null;
	    }
	}catch(error){
		console.log(error);
		return null;
	}
}
function writeToCSV(){
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
}

async function main(){
	var totalASacar=current.length-desdeCualPartimos;
	var numeroTandas=Math.ceil(totalASacar/numMesasSimultaneas);

	var deberiaTerminar=false;
	for(var tanda=0;tanda<numeroTandas;++tanda){
		console.log("TANDA "+tanda+" de "+numeroTandas);
		if(deberiaTerminar)
			break;
		var resultados=[];
		for(var i=0;i<numMesasSimultaneas;++i){
			var fila=desdeCualPartimos+tanda*numMesasSimultaneas+i;
			if(fila==current.length){
				break;
			}
			resultados.push(GetComputosPorMesa(fila));
		}
		  var obtenidos = await Promise.all(resultados);
		  var mezclados = [];
		  for(var i=0;i<obtenidos.length;++i){
		  	if(obtenidos[i]===null){
		  		deberiaTerminar=true;
		  		break;
		  	}
		  	mezclados=mezclados.concat(obtenidos[i]);
		  }
		  if(!deberiaTerminar){
		  	salida=salida.concat(mezclados);
		  	fs.writeFileSync(archivo_salida+'.json', JSON.stringify(salida));
		  }
	}
	writeToCSV();
}

main();

