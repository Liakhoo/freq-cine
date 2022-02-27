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


//Récupération des valeurs par champs
async function getPromiseValues(ket) {
    let data = await getDataPromise();
    let filteredData = filterTaille(data);
    let rawYear = getValues(filteredData, ket);
    return rawYear;

};

let rawYear = getPromiseValues("year");
let rawRegion = getPromiseValues("region");


//Détermination des bornes du slider
rawYear.then((result) => {
	let minYear = d3.min(result);
	document.getElementById("rangeSlider").min = d3.min(result);
	document.getElementById("rangeSlider").max = d3.max(result);
	document.getElementById("rangeSlider").value = d3.min(result);
  });





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


function getValues(dataset, key) {
	let L= new Set; //Le Set permet de gérer l'unicité des valeurs
	//Distinction dans le cadre de l'année car la récupération des valeurs nécessite un traitement du format
	if (key == "year") {
    	let i = 0;
    	while (i < dataset.length) {
        	L.add(dataset[i].year.getFullYear());
        	i++;
      	};
  	}
  	else {
    	for (let element in dataset) {
      		let test_obj = Object.assign({}, dataset[element]);  //La copie de l'objet permet de récupérer convenablement les valeurs pour n'importe quelle clé.
      		L.add(test_obj[key]);
    	} 
  	}
  	L.delete(undefined); //Valeur ajoutée lors de la création du Set, inutile ici.
  	return Array.from(L); //Conversion du Set en Array
};
