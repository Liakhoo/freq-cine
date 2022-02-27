const number = 322;



//importation des données
data = d3.csv("https://raw.githubusercontent.com/Lyspa/freq-cine/main/freq-cine.csv", d => {
  let res = {}
  res.region = d["region"]
  res.year = parseDate(d["annee"])
  res.type = d["type"]
  res.etab = +d["nb_etab"]
  res.ecrans = +d["nb_ecrans"]
  res.fauteuils = +d["nb_fauteuils"]
  res.seances = +d["nb_seances"]*1/1
  res.entrees = Math.round(+d["nb_entrees"]/10000)/100  // en millions
  res.recette = Math.round(+d["recette"]/1000)/100 // en millions
  res.rme = Math.round(+d["rme"]*100)/100
  res.freq = Math.round(+d["indice_freq"]*100)/100
  res.tmof = Math.round(+d["tmof"]*100)/100
  return res
})
parseDate= d3.timeParse("%Y")
parseRegion = (element) => {
  let regions = getValues(getValues(france.features,"properties"),"nom");
  regions.splice(9,5);
  regions.sort((a, b) => a.localeCompare(b));
  let regionMap = buildMap(rawRegion, regions);

  return regionMap.get(element)
}
parseRegionInverse = (element) => {
  let regions = getValues(getValues(france.features,"properties"),"nom");
  regions.splice(9,5);
  regions.sort((a, b) => a.localeCompare(b));
  let regionMap = buildMap(regions, rawRegion);

  return regionMap.get(element)
}

//ipmortation fonctions utiles
filterTaille = (dataset) => {
  let res = [];
  for (let element of dataset){
    if (element["type"] != "T" && element["type"] != "AE"){
      res.push(element)
    }
  }
  return res;
}
filteredData = filterTaille(data)
getValues = (dataset, key) => {
  let L= new Set; //Le Set permet de gérer l'unicité des valeurs

  //Distinction dans le cadre de l'année car la récupération des valeurs nécessite un traitement du format
  if (key == "year") {
      let i = 0;
      while (i < dataset.length) {
        L.add(dataset[i].year.getFullYear());
        i++;
      }
  }
  else {
    for (let element in dataset) {
      let test_obj = Object.assign({}, dataset[element]);  //La copie de l'objet permet de récupérer convenablement les valeurs pour n'importe quelle clé.
      L.add(test_obj[key]);
    } 
  }
  L.delete(undefined); //Valeur ajoutée lors de la création du Set, inutile ici.
  return Array.from(L); //Conversion du Set en Array
}
rawYear = getValues(filteredData, "year");
rawRegion = getValues(filteredData, "region");
getKey = (expr) => {
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
getTitle = (expr) => {
  switch (expr) {
    case "Recette":
      return "des recettes";
    case "Recette moyenne par entrée":
      return "de la recette moyenne par entrée (RME)";
    case "Nombre d'entrées":
      return "du nombre d'entrees";
    case "Nombre de séances":
      return "du nombre de séances";
    case "Nombre d'établissements":
      return "du nombre d'établissements";
    case "Nombre d'écrans":
      return "du nombre d'écrans";
    case "Nombre de fauteuils":
      return "du nombre de fauteuils";
    case "Taux moyen d'occupation des fauteuils":
      return "du taux moyen d'occupation des fauteuils";
    default:
      return "";
  }
}
getType = (expr) => {
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
keys = ["etab","ecrans","fauteuils","seances","entrees","recette","rme","freq","tmof"]
names = ["Établissements","Écrans","Fauteuils","Séances","Entrées","Recette","Recette moyenne par entrée","Indice de fréquentation","Taux moyen d'occupation des fauteuils"]
keyMap = buildMap(keys,names)
unit = ["","","","milliers","millions","M€","€","","%"]
unitMap = buildMap(keys,unit)
buildMap = (keys,values) => {
  const map = new Map();
   for(let i = 0; i < keys.length; i++){
      map.set(keys[i], values[i]);
   };
   return map;
};

//importation des fonctions utiles
//Pour la carte
france = d3.json("https://france-geojson.gregoiredavid.fr/repo/regions.geojson")
d3geo = require("d3-geo-projection")

geo_map = (w=700, h=500, g) => {
  // initialisation du tooltip  
  const svg =
    g ||
    d3
      .create("svg")
      .attr("viewBox", [0, 0, w, h])
      .attr("width", w/2)
      .attr("height", h/2);

  let margin = { top: 10, right: 10, bottom: 10, left: 10 };

  let width = w - margin.left - margin.right,
    height = h - margin.top - margin.bottom;
  
let projection = d3.geoConicConformal()
    .center([2.454071, 46.279229])
    .scale(2600)
    .translate([width / 2, height / 2]);
  
 let path = d3.geoPath(projection)
 var isClicked = false
 var chosen_node = '' // définition de chosen_node pour éviter les erreurs d'exécution
 var chosen_region = '' // définition de chosen_region pour éviter les erreurs d'exécution

 var tooltip = d3.select('body')
            .append('div')
            .attr('class','tooltip')
            .attr('style', 'position: absolute; opacity: 0;  text-align: center;')
            .style('width','100px')
            .style('height','70px') 
            .style('padding', '2px')  
            .style('background', '#FFFFE0')
            .style('border', '1px')
  var tooltipStats = tooltip.append('div')
        .attr('class', 'stats');
  
    // world map
  svg.append("g").selectAll("path")
    .data(france.features)
    .enter()
    .append("path")
    .attr("d", path)
    .style('fill-opacity', 1)
    .style('fill','rgb(104,104,104)')
    .style('stroke','black')
    .attr('class', d => d.properties.nom.split(' ').join('-').split("'").join('')) //ajuster nom pour enlever espace et apostrophe qui empêche bon fonctionnement du code
    .attr('type','region')
    .on("mouseover", function(e,d) {
      // Création tooltip
      tooltipStats.html('<p> Please show up </p>') 
      tooltip.style('opacity', 1).text(d.properties.nom).attr('x', (d3.pointer(e,this)[0]-10)+"px").attr('y',d3.pointer(e,this)[1]+"px").style('visibility','visible')
//      svg.append("title")
//        .attr("id", "tooltip")
//        .attr("x", d3.pointer(e,this)[0])
//        .attr("y", d3.pointer(e,this)[1])
//        .text(d.properties.nom)
      // Gestion couleur
      if (!isClicked){d3.select(this)
        .style("fill","red")
        .style("cursor","pointer")}
      else {if(this != chosen_node){d3.select(this) // Changement de la couleur de passage du pointeur lorsqu'une région sélectionnée
        .style("fill","#ff5a5a")
        .style("cursor","pointer")}}})
//    .on("mousemove", (e,d) => {
//      })
    .on("click", (e,d) => {
      //Modification du scatterplot
      mouseOverScatter(d.properties.nom);
      isClicked = true
      //Modification de la carte, remise en gris des régions non sélectionnées
      let nodes = document.querySelectorAll('path[type="region"]');
      for (let c of nodes){
        c.style.fill = "rgb(104,104,104)";
        c.style.stroke = "#000000";
      }
      chosen_node = document.querySelector(`.${d.properties.nom.split(' ').join('-').split("'").join('')}`)
      chosen_region = d.properties.nom
      
      //Changement titre carte
      let title_node = document.querySelectorAll('.title')
      title_node[0].innerHTML = `La région choisie est : ${chosen_region}`
      //console.log(title_node)
      
      // Coloration en rouge de la région sélectionnée
      chosen_node.style.fill = "red";
    
      // Changement de la line chart
      let q_var = parseRegionInverse(chosen_region)
      let td_node = document.querySelectorAll('#line_chart');  //récupération du td contenant le line chart
      //console.log(td_node)
      console.log(q_var);
      let svg_node = td_node[0].querySelectorAll('svg'); //recuperation du noeud svg du line chart
      td_node[0].replaceChild(chart(getKey(variable),q_var,"T"), svg_node[0]);})
    .on("mouseleave", function(d) {
      tooltip.style('opacity', 0).style('visibility','hidden')
 ///     svg.selectAll("#tooltip").remove()
      
      
      // Gestion de la couleur
      if(this != chosen_node){
         d3.select(this)
            .style("fill","rgb(104,104,104)")}})

    svg.append("text")
       .attr('class','title')
       .style("font-size","20px")
       .style("text-anchor", "middle")
       .attr("x", (w + margin.left + margin.right)/2)
       .attr("y", h-margin.bottom)
      .text('Choisissez la région à étudier')
  return svg.node()
}

//Pour le scatterplot
checkbox_P.addEventListener('change', () => {
    modify_scatter();
})
checkbox_M.addEventListener('change', () => {
    modify_scatter();
})
checkbox_G.addEventListener('change', () => {
    modify_scatter();
})

modify_scatter = () => {
  let td_node = document.querySelectorAll('#scatter');  //récupération du div contenant le scatterplot
  let svg_node = td_node[0].querySelectorAll('svg'); //recuperation du noeud svg du scatterplot
  td_node[0].replaceChild(scatterplot(filteredData,getKey(variable)), svg_node[0]); // mise à jour du scatterplot
}

calculateMin = (dataset, dataP, dataM, dataG, key) => {
  let min_P = d3.max(dataset, d => d[key])
  let min_M = d3.max(dataset, d => d[key])
  let min_G = d3.max(dataset, d => d[key])
  if (document.querySelector('#petit').checked){
    min_P = d3.min(dataP, d => d[key]);
  }
  if (document.querySelector('#moyen').checked){
    min_M = d3.min(dataM, d => d[key]);
  }
  if (document.querySelector('#grand').checked){
    min_G = d3.min(dataG, d => d[key]);
  }
  return Math.min(min_P, min_M, min_G);
}
 
calculateMax = (dataP, dataM, dataG, key) => {
  let max_P = 0;
  let max_M = 0;
  let max_G = 0;
  if (document.querySelector('#petit').checked){
    max_P = d3.max(dataP, d => d[key]);
  }
  if (document.querySelector('#moyen').checked){
    max_M = d3.max(dataM, d => d[key]);
  }
  if (document.querySelector('#grand').checked){
    max_G = d3.max(dataG, d => d[key]);
  }
  return Math.max(max_P, max_M, max_G);
}

mouseOverScatter = (region) => {
  let nodes = document.querySelectorAll('*[type="scatter"]');
  for (let c of nodes){
        c.style.opacity = 0.15;
  }
  let chosen_nodes = document.querySelectorAll(`.scatter_${region.split(' ').join('-').split("'").join('')}`);
  console.log(chosen_nodes);
  for (let c of chosen_nodes){
        c.style.opacity = 1;
  }
}

mouseLeaveScatter = () => {
  let nodes = document.querySelectorAll('*[type="scatter"]');
  for (let c of nodes){
        c.style.opacity = 1;
  }
}

scatterplot = (dataset, var_x = "recette", var_y = "freq") => {
  // set the dimensions and margins of the graph
  var margin = {top: 30, right: 0, bottom: 10, left: 30},
      width = 400 - margin.left - margin.right,
      height = 300 - margin.top - margin.bottom;

  let date = d3.select("#rangeSlider").property("value");
  let newdataset = dataset.filter(d => d.year.toDateString() === parseDate(date).toDateString());

  let dataset_P = dataset.filter(d => d.type === "P");
  let dataset_M = dataset.filter(d => d.type === "M");
  let dataset_G = dataset.filter(d => d.type === "G");
  
  let newdataset_P = newdataset.filter(d => d.type === "P");
  let newdataset_M = newdataset.filter(d => d.type === "M");
  let newdataset_G = newdataset.filter(d => d.type === "G");

  


  //Calcul x min
  let global_xmin = calculateMin(dataset, dataset_P, dataset_M, dataset_G, var_x);
  //Calcul x max
  let global_xmax = calculateMax(dataset_P, dataset_M, dataset_G, var_x);
  //Calcul y max
  let global_ymax = calculateMax(dataset_P, dataset_M, dataset_G, var_y);
  //Calcul t min
  let global_tmin = calculateMin(dataset, dataset_P, dataset_M, dataset_G, "etab");
  //Calcul t max
  let global_tmax = calculateMax(dataset_P, dataset_M, dataset_G, "etab");


  const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width+margin.left+margin.right, height+margin.top+margin.bottom])

  const x = d3.scaleLinear()
    .domain([global_xmin, global_xmax])   //On considère le jeu entier de données pour que les axes ne varient pas entre les années.
    .range([margin.left, width-margin.right])

  const y = d3.scaleLinear()
    .domain([global_ymax,0])
    .range([margin.top, height - margin.bottom])

  //Pour la taille
  const taille = d3.scaleLinear()
    .domain([global_tmin, global_tmax])
    .range([1, 10])

  d3.schemePaired.push("#F236BB")
  const color = d3.scaleOrdinal(d3.schemePaired)

  //Axes
  let xAxis = g => g
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .style("font-size","5px")
    .call(d3.axisBottom(x))

let yAxis = g => g
    .attr("transform", `translate(${margin.left},0)`)
    .style("font-size","5px")
    .call(d3.axisLeft(y))

  svg.append("g")
      .call(xAxis);

  svg.append("g")
      .call(yAxis);

  //Année
  svg.append("text")
    .attr("class", "y label")
    .style("font-size","50px")
    .attr("fill","#c6c6c6")
    .attr("text-anchor", "middle")
    .attr("x", margin.left + 3*width/4)
    .attr("y", margin.top + 4*height/5)
    .text(`${date}`);

  //Points
  if (document.querySelector('#petit').checked){
    svg.selectAll("circle").data(newdataset_P)
    .enter()
    .append("circle")
    .attr("class", d => "scatter_" + parseRegion(d.region).split(' ').join('-').split("'").join(''))
    .attr("type", "scatter")
    .attr("cx", d => x(d[var_x]))
    .attr("cy", d => y(d[var_y]))
    .attr("r", d => taille(d["etab"]))
    .attr("fill", d => color(d.region))
    .attr("stroke", "black")
    .on("mouseover", function(d) {
        console.log(d.srcElement.__data__.region);
        mouseOverScatter(parseRegion(d.srcElement.__data__.region));
      })
      .on("mouseleave", function(d) {
        mouseLeaveScatter();
      })
    .append("title")
    .text(d => "Région : " + parseRegion(d.region) + "\nAnnée : " + d["year"].getFullYear() + "\n\nTaille des établissements : " + getType("P") + "\nNombre d'établissements : " + d.etab + "\n\n" + getTitle(variable) + " : " + d[var_x] + "\nIndice de fréquentation : " + d[var_y])
      
  }
  
  //Carrés
  if (document.querySelector('#moyen').checked){
    svg.selectAll("rect").data(newdataset_M)
      .enter()
      .append("rect")
      .attr("class", d => "scatter_" + parseRegion(d.region).split(' ').join('-').split("'").join(''))
      .attr("type", "scatter")
      .attr("x", d => x(d[var_x]) - taille(d["etab"]))
      .attr("y", d => y(d[var_y]) - taille(d["etab"]))
      .attr("height", d => 2*taille(d["etab"]))
      .attr("width", d => 2*taille(d["etab"]))
      .attr("fill", d => color(d.region))
      .attr("stroke", "black")
      .on("mouseover", function(d) {
        console.log(d.srcElement.__data__.region);
        mouseOverScatter(parseRegion(d.srcElement.__data__.region));
      })
      .on("mouseleave", function(d) {
        mouseLeaveScatter();
      })
      .append("title")
      .text(d => "Région : " + parseRegion(d.region) + "\nAnnée : " + d["year"].getFullYear() + "\n\nTaille des établissements : " + getType("M") + "\nNombre d'établissements : " + d.etab + "\n\n" + getTitle(variable) + " : " + d[var_x] + "\nIndice de fréquentation : " + d[var_y])
  }

  //Triangles
  if (document.querySelector('#grand').checked){
    svg.selectAll("polygon").data(newdataset_G)
      .enter()
      .append("polygon")
      .attr("class", d => "scatter_" + parseRegion(d.region).split(' ').join('-').split("'").join(''))
      .attr("type", "scatter")
      .attr("points", d => {
            return String(x(d[var_x]) - taille(d["etab"])) + "," + String(y(d[var_y]) + taille(d["etab"])) + " " + String(x(d[var_x])) + "," + String(y(d[var_y]) - taille(d["etab"])) + " " + String(x(d[var_x]) + taille(d["etab"])) + "," + String(y(d[var_y]) + taille(d["etab"]));
      })
      .attr("fill", d => color(d.region))
      //.attr("stroke", "black")
      .on("mouseover", function(d) {
        console.log(d.srcElement.__data__.region);
        mouseOverScatter(parseRegion(d.srcElement.__data__.region));
      })
      .on("mouseleave", function(d) {
        mouseLeaveScatter();
      })
      .append("title")
      .text(d => "Région : " + parseRegion(d.region) + "\nAnnée : " + d["year"].getFullYear() + "\n\nTaille des établissements : " + getType("G") + "\nNombre d'établissements : " + d.etab + "\n\n" + getTitle(variable) + " : " + d[var_x] + "\nIndice de fréquentation : " + d[var_y])
  }

    //Création du titre du graphique
  svg.append("text")
    .style("font-size","8px")
    .style("text-anchor", "middle")
    .attr("x", (width + margin.left + margin.right)/2)
    .attr("y", margin.top)
    .text(`Indice de fréquentation en fonction ${getTitle(variable)} `);

  //Creation du titre de l'axe des abscisses
  svg.append("text")
    .attr("class", "x label")
    .style("font-size","6px")
    .style("text-anchor", "middle")
    .attr("x", (width + margin.left + margin.right)/2)
    .attr("y", height + margin.bottom + 5)
    .text(`${keyMap.get(getKey(variable))} (${unitMap.get(getKey(variable))})`);

  //Creation du titre de l'axe des ordonnees
  svg.append("text")
    .attr("class", "y label")
    .style("font-size","6px")
    .attr("text-anchor", "middle")
    .attr("x", 0)
    .attr("y", 0)
    .attr("transform", `rotate(-90) translate(${-(height + margin.bottom + margin.top)/2 +10},10)`)
    .text("Indice de fréquentation");


  return svg.node();
}

legend_scatterplot = () => {
  // set the dimensions and margins of the graph
  var margin = {top: 30, right: 60, bottom: 5, left: 5},
      width =450 - margin.left - margin.right,
      height = 200 - margin.top - margin.bottom;

  const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width+margin.left+margin.right, height+margin.top+margin.bottom])
      .attr("width", 2*(width+margin.left+margin.right))
      .attr("height", 2*(height+margin.top+margin.bottom))


  d3.schemePaired.push("#F236BB")
  const color = d3.scaleOrdinal(d3.schemePaired)


  svg.selectAll("rect").data(rawRegion)
    .enter()
    .append("rect")
    .attr("x", margin.left)
    .attr("y", (d, i) => i * 10 + 25)
    .attr("width", 5)
    .attr("height", 5)
    .attr("fill", d => color(d))
    .attr("stroke", "black")

  svg.selectAll("text").data(rawRegion)
    .enter()
    .append("text")
    .attr("x", margin.left + 12)
    .attr("y", (d, i) => i * 10 + 29)
    .style("font-size","5px")
    .text(d => parseRegion(d))

  return svg.node();
}

//Pour le line chart
chart = (k = "freq", q = "ILE-DE-FRANCE",type = "T") => {
  const margin = ({top: 45, right: 30, bottom: 50, left: 60})
  const height = 350;
  const width = 750;
  //const key = getKey(variable)
  //const unit = getUnit(variable)

  //Création du svg
  const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, height])
      .attr("width", 3*width/4)
      .attr("height", 3*height/4);

  //Filtrage du jeu de données selon le pays et la date choisis
  var newdataset = data.filter(d => d.region == q)
  newdataset = newdataset.filter(d => d.type == type)
  
  //Récupération des données à afficher
  const dataValue = getValues(newdataset,k)
  const rawYear = getValues(data, "year").sort();

  //Mise à l'échelle de l'axe des abscisses
  const x = d3.scaleTime()
    .domain(d3.extent([parseDate(rawYear[0]),parseDate(rawYear[rawYear.length-1])]))
    .range([margin.left, width - margin.right])
  
  //Mise à l'échelle de l'axe des ordonnées
  const y = d3.scaleLinear()
    .domain([d3.max(dataValue), 0])
    .range([margin.top, height - margin.bottom])

//Création de la ligne
let line = d3.line()
    .x((d, i) => x(d.year)-margin.left)
    .y(d => y(d[k]))
  
  svg.append("g").attr("transform", `translate(${margin.left}, 0)`).selectAll("path")
    .data([newdataset])
    .enter()
    .append("path")
    .attr("d", d => line(d))
    .attr("fill", "none")
    .attr("stroke", "blue")

  //Création du titre du graphique
  svg.append("text")
    .attr("class", "titlebis")
    .style("font-size","20px")
    .style("text-anchor", "middle")
    .attr("x", (width + margin.left + margin.right)/2)
    .attr("y", margin.top/3)
    .text(`${keyMap.get(k)} de la région : ${parseRegion(q)}`);

  //Création du titre des axes
  svg.append("text")
    .attr("class", "x label")
    .style("font-size","15px")
    .style("text-anchor", "middle")
    .attr("x", (width + margin.left + margin.right)/2)
    .attr("y", height - 15)
    .text("Année");

  svg.append("text")
    .attr("class", "y label")
    .style("font-size","15px")
    .attr("text-anchor", "middle")
    .attr("x", margin.top)
    .attr("y", margin.left-55)
    .attr("transform", `rotate(-90) translate(${-(height + margin.bottom + margin.top)/2 +10},10)`)
    .text(`${keyMap.get(k)} (${unitMap.get(k)})`);

//Création des axes et affichage
let xAxis = g => g
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x))

let yAxis = g => g
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))

  svg.append("g")
      .call(xAxis);

  svg.append("g")
      .call(yAxis);

  return svg.node()
}

//initialisation visualisation
checkbox_P = document.getElementById('petit')
checkbox_M = document.getElementById('moyen')
checkbox_G = document.getElementById('grand')

d3.select("#rangeSlider").on("input", function() {
  modify_scatter();
});
d3.select("#start").on("click", function() {
 //clearInterval (myTimer);
   let myTimer = setInterval (function() {
      var b= d3.select("#rangeSlider");
      var t = (+b.property("value") + 1) % (+b.property("max") + 1);
      if (t == 0) { t = +b.property("min"); }
      b.property("value", t);
     modify_scatter();
    }, 1000);
});
d3.select("#reset").on("click",function () {
  let map_node = document.querySelector("#carte").querySelector("svg")
  console.log(map_node)
  let nodes = map_node.querySelectorAll('path[type="region"]');
  console.log(nodes)
      for (let c of nodes){
        c.style.fill = "rgb(104,104,104)";
        c.style.stroke = "#000000";
      }
});
d3.select("#stop").on("click", function(myTimer) {
   clearInterval (myTimer);
  console.log(myTimer)
});

//importation des sélecteurs
viewof variable = html`<select id="DateSelect">${["Nombre d'entrées","Nombre d'établissements","Nombre d'écrans","Nombre de fauteuils","Nombre de séances","Recette","Recette moyenne par entrée","Taux moyen d'occupation des fauteuils"].map(d => html`<option>${d}</option>`)}</select>`;
