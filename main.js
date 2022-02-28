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
async function getPromiseValues(key) {
    let data = await getDataPromise();
    let filteredData = filterTaille(data);
    let rawYear = getValues(filteredData, key);
    return rawYear;

};

let rawYear = getPromiseValues("year");
let rawRegion = getPromiseValues("region");


//Récupération des propriétés de la France pour la carte
function getFrancePromise() {
	return d3.json("https://france-geojson.gregoiredavid.fr/repo/regions.geojson");
}


//Détermination des bornes du slider
rawYear.then((result) => {
	let minYear = d3.min(result);
	document.getElementById("rangeSlider").min = d3.min(result);
	document.getElementById("rangeSlider").max = d3.max(result);
	document.getElementById("rangeSlider").value = d3.min(result);
  });


//importation données utiles
const keys = ["etab","ecrans","fauteuils","seances","entrees","recette","rme","freq","tmof"];
const names = ["Établissements","Écrans","Fauteuils","Séances","Entrées","Recette","Recette moyenne par entrée","Indice de fréquentation","Taux moyen d'occupation des fauteuils"];
const keyMap = buildMap(keys,names);
const unit = ["","","","milliers","millions","M€","€","","%"];
const unitMap = buildMap(keys,unit);




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


async function parseRegion(element) {
	let france = await getFrancePromise();
	let regions = getValues(getValues(france.features,"properties"),"nom");
	regions.splice(9,5);
	regions.sort((a, b) => a.localeCompare(b));
	let rawRegion = await getPromiseValues("region");
 	let regionMap = buildMap(rawRegion, regions);

	return regionMap.get(element);
}

async function parseRegionInverse(element) {
	let france = await getFrancePromise();
  	let regions = getValues(getValues(france.features,"properties"),"nom");
  	regions.splice(9,5);
  	regions.sort((a, b) => a.localeCompare(b));
  	let rawRegion = await getPromiseValues("region");
  	let regionMap = buildMap(regions, rawRegion);

  return regionMap.get(element);
}


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


function buildMap(keys,values) {
  const map = new Map();
   for(let i = 0; i < keys.length; i++){
      map.set(keys[i], values[i]);
   };
   return map;
};


function getTitle(expr) {
  switch (expr) {
    case "recette":
      return "des recettes";
    case "rme":
      return "de la recette moyenne par entrée (RME)";
    case "entrees":
      return "du nombre d'entrees";
    case "seances":
      return "du nombre de séances";
    case "etab":
      return "du nombre d'établissements";
    case "Nombre d'écrans":
      return "ecrans";
    case "Nombre de fauteuils":
      return "fauteuils";
    case "Taux moyen d'occupation des fauteuils":
      return "tmof";
    default:
      return "";
  }
}

function getKey(expr) {
  switch (expr) {
    case "Recette":
      return "recette";
    case "Recette moyenne par entrée":
      return "rme";
    case "Nombre d'entrées":
      return "entrees";
    case "Nombre de séances":
      return "seances";
    case "Nombre d'établissements":
      return "etab";
    case "Nombre d'écrans":
      return "ecrans";
    case "Nombre de fauteuils":
      return "fauteuils";
    case "Taux moyen d'occupation des fauteuils":
      return "tmof";
    default:
      return "";
  }
}

function getType(expr) {
  switch (expr) {
    case "P":
      return "Petite";
    case "M":
      return "Moyenne";
    case "G":
      return "Grande";
    default:
      return "";
  }
}



function mouseOverScatter(region) {
  let nodes = document.querySelectorAll('*[type="scatter"]');
  for (let c of nodes){
        c.style.opacity = 0.15;
  }
  let chosen_nodes = document.querySelectorAll(`.scatter_${region.split(' ').join('-').split("'").join('')}`);
  //console.log(chosen_nodes);
  for (let c of chosen_nodes){
        c.style.opacity = 1;
  }
}

function mouseLeaveScatter() {
  let nodes = document.querySelectorAll('*[type="scatter"]');
  for (let c of nodes){
        c.style.opacity = 1;
  }
}