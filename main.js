//importation des données
let url = "https://raw.githubusercontent.com/Lyspa/freq-cine/main/freq-cine.csv";
let data = [];

function getDataPromise() {
	let dataPromise = d3.csv(url, function(d) {
			let res = {};
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
	  		return res;
});
	return dataPromise;
}


let parseDate= d3.timeParse("%Y");


async function doSomething() {
    let data = await getDataPromise();
    let filteredData = filterTaille(data);
    console.log(filteredData);

};


doSomething();



//importation fonctions utiles

function filterTaille(dataset) {
	let res = [];
	for (let element of dataset){
    	if (element["type"] != "T" && element["type"] != "AE"){
      		res.push(element)
    	}
  	}
 	return res;
};


//important donnees utiles
