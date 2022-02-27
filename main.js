//importation des données
let url = "https://raw.githubusercontent.com/Lyspa/freq-cine/main/freq-cine.csv";
let data = [];

d3.csv(url, function(error, csv) {
  if (error) throw error;
  data = csv;
});

/*
d3.csv(url, function(donnees) {
		for (let d of donnees){
			res = {}
	  		//console.log(d);
	  		res.region = d["region"];
	  		res.year = parseDate(d["annee"]);
		    res.type = d["type"];
		    res.etab = +d["nb_etab"];
		    res.ecrans = +d["nb_ecrans"];
		    res.fauteuils = +d["nb_fauteuils"];
		    res.seances = +d["nb_seances"]*1/1;
		    res.entrees = Math.round(+d["nb_entrees"]/10000)/100;  // en millions
		    res.recette = Math.round(+d["recette"]/1000)/100; // en millions
		    res.rme = Math.round(+d["rme"]*100)/100;
		    res.freq = Math.round(+d["indice_freq"]*100)/100;
		    res.tmof = Math.round(+d["tmof"]*100)/100;
	  		data.push(res);
	  	}
});*/

let parseDate= d3.timeParse("%Y");

function parseRegion(element) {
  let regions = getValues(getValues(france.features,"properties"),"nom");
  regions.splice(9,5);
  regions.sort((a, b) => a.localeCompare(b));
  let regionMap = buildMap(rawRegion, regions);

  return regionMap.get(element);
}

console.log(data)