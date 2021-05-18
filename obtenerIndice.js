'use strict';
const axios = require("axios");
const fs = require('fs');
const comunasURL = "https://www.servelelecciones.cl/data/elecciones_convencionales_g/filters/comunas/all.json";
const circPorComunaURL = "https://www.servelelecciones.cl/data/elecciones_convencionales_g/filters/circ_electoral/bycomuna/";
const localesURL = "https://www.servelelecciones.cl/data/elecciones_convencionales_g/filters/locales/bycirc_electoral/";
const mesasLocalesURL = "https://www.servelelecciones.cl/data/elecciones_convencionales_g/filters/mesas/bylocales/";
const computoPorMesaURL = "https://www.servelelecciones.cl/data/elecciones_convencionales_g/computomesas/";
const computoParticipacionPorLocalURL = "https://www.servelelecciones.cl/data/participacion/computo/locales/";

var salida=[];

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

async function GetMesas(local,circ,comuna){
    try{
	const mesas = await getData(mesasLocalesURL+local.c+".json");
	if(mesas!=null){
	    for(var i=0;i<mesas.length;++i){
		var actual = {'COMUNA':comuna.d,"C_COMUNA":comuna.c,'CIRC_ELEC':circ.d,'C_CIRC_ELEC':circ.c,'LOCAL':local.d,'C_LOCAL':local.c,'MESA':mesas[i].d,'C_MESA':mesas[i].c};
		console.log("-XXX--- : "+JSON.stringify(actual));
		salida.push(actual);
		if(salida.length%100==0){
		    fs.writeFileSync('indice_mesas.json', JSON.stringify(salida));
		}
	    }
	}
    }catch(error){
	console.log(error);
    }
}

async function GetLocales(circ,comuna){
    try{
	const locales = await getData(localesURL+circ.c+".json");
	if(locales!=null){
	    for(var i=0;i<locales.length;++i){
		console.log("--- ---EN LOCAL " + locales[i].d);
		await GetMesas(locales[i],circ,comuna);
	    }
	}
    }catch(error){
	console.log(error);
    }
}

async function GetCircs(comuna){
    try{
	const circs = await getData(circPorComunaURL+comuna.c+".json");
	if(circs!=null){
	    for(var i=0;i<circs.length;++i){
		console.log("---EN CIRC " + circs[i].d);
		await GetLocales(circs[i],comuna);
	    }
	}
	else{
	    console.log('error');
	    exit;
	}
    }catch(error){
	console.log(error);
    }
}

async function GetComuna() {
    try{
	const comunas = await getData(comunasURL);
	if(comunas!=null){
	    for(var i=0;i<comunas.length;++i){
		console.log("EN COMUNA " + comunas[i].d);
		if(listaComunas.includes(comunas[i].d)){
			console.log("YA ESTA");
			continue;
		}else{
			await GetCircs(comunas[i]);
		}
	    }
	}
    }catch(error){
	console.log(error);
    }
    fs.writeFileSync('indice_mesas.json', JSON.stringify(salida));
}
var listaComunas=[];
GetComuna();

