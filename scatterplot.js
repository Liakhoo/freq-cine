async function scatterplot(var_x = "recette", var_y = "freq") {
  // set the dimensions and margins of the graph
  var margin = {top: 30, right: 0, bottom: 10, left: 50},
      width = 550 - margin.left - margin.right,
      height = 350 - margin.top - margin.bottom;

  //Préparation données
  let date = d3.select("#rangeSlider").property("value");

  let data = await getDataPromise();
  let dataset = filterTaille(data);
  let newdataset = dataset.filter(d => d.year.toDateString() === parseDate(date).toDateString());

  let dataset_P = dataset.filter(d => d.type === "P");
  let dataset_M = dataset.filter(d => d.type === "M");
  let dataset_G = dataset.filter(d => d.type === "G");
  
  let newdataset_P = newdataset.filter(d => d.type === "P");
  let newdataset_M = newdataset.filter(d => d.type === "M");
  let newdataset_G = newdataset.filter(d => d.type === "G");

  function calculateMin(dataset, dataP, dataM, dataG, key) {
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

  function calculateMax(dataP, dataM, dataG, key) {
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


  //Contenu de parseRegion
  let france = await getFrancePromise();
  let regions = getValues(getValues(france.features,"properties"),"nom");
  regions.splice(9,5);
  regions.sort((a, b) => a.localeCompare(b));
  const rawRegion = getValues(data, "region");
  let regionMap = buildMap(rawRegion, regions);

  const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width+margin.left+margin.right, height+margin.top+margin.bottom])
      //.attr("width", document.getElementById('scatter').clientWidth)
      //.attr("height", 3*(height+margin.top+margin.bottom)/2);

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

  d3.schemePaired.push("#F236BB");
  //const rawRegion = getValues(data, "region");
  const color = d3.scaleOrdinal(rawRegion,d3.schemePaired);

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
    .attr("class", d => "scatter_" + regionMap.get(d.region).split(' ').join('-').split("'").join(''))
    .attr("type", "scatter")
    .attr("cx", d => x(d[var_x]))
    .attr("cy", d => y(d[var_y]))
    .attr("r", d => taille(d["etab"]))
    .attr("fill", d => color(d.region))
    .attr("stroke", "black")
    .style("opacity",d => isClicked ? (chosen_region.includes(regionMap.get(d.region)) ? 1 : 0.15) : 1)
    .on("mouseover", function(d) {
        if (!isClicked){
          mouseOverScatter(regionMap.get(d.region));
        }
      })
    .on("mouseleave", function(d) {
        if (!isClicked){
          mouseLeaveScatter();
        }
      })
    .append("title")
    .text(d => "Région : "+ regionMap.get(d.region) + "\nAnnée : " + d["year"].getFullYear() + "\n\nTaille des établissements : " + getType("P") + "\nNombre d'établissements : " + d.etab + "\n\n" + getTitle(variable) + " : " + d[var_x] + "\nIndice de fréquentation : " + d[var_y])
      
  }
  
  //Carrés
  if (document.querySelector('#moyen').checked){
    svg.selectAll("rect").data(newdataset_M)
      .enter()
      .append("rect")
      .attr("class", d => "scatter_" + regionMap.get(d.region).split(' ').join('-').split("'").join(''))
      .attr("type", "scatter")
      .attr("x", d => x(d[var_x]) - taille(d["etab"]))
      .attr("y", d => y(d[var_y]) - taille(d["etab"]))
      .attr("height", d => 2*taille(d["etab"]))
      .attr("width", d => 2*taille(d["etab"]))
      .attr("fill", d => color(d.region))
      .attr("stroke", "black")
      .style("opacity",d => isClicked ? (chosen_region.includes(regionMap.get(d.region)) ? 1 : 0.15) : 1)
      .on("mouseover", function(d) {
        if (!isClicked){
          mouseOverScatter(regionMap.get(d.region));
        }
      })
    .on("mouseleave", function(d) {
        if (!isClicked){
          mouseLeaveScatter();
        }
      })
      .append("title")
      .text(d => "Région : " + regionMap.get(d.region) + "\nAnnée : " + d["year"].getFullYear() + "\n\nTaille des établissements : " + getType("M") + "\nNombre d'établissements : " + d.etab + "\n\n" + getTitle(variable) + " : " + d[var_x] + "\nIndice de fréquentation : " + d[var_y])
  }

  //Triangles
  if (document.querySelector('#grand').checked){
    svg.selectAll("polygon").data(newdataset_G)
      .enter()
      .append("polygon")
      .attr("class", d => "scatter_" + regionMap.get(d.region).split(' ').join('-').split("'").join(''))
      .attr("type", "scatter")
      .attr("points", d => {
            return String(x(d[var_x]) - taille(d["etab"])) + "," + String(y(d[var_y]) + taille(d["etab"])) + " " + String(x(d[var_x])) + "," + String(y(d[var_y]) - taille(d["etab"])) + " " + String(x(d[var_x]) + taille(d["etab"])) + "," + String(y(d[var_y]) + taille(d["etab"]));
      })
      .attr("fill", d => color(d.region))
      .style("opacity",d => isClicked ? (chosen_region.includes(regionMap.get(d.region)) ? 1 : 0.15) : 1)
      //.attr("stroke", "black")
      .on("mouseover", function(d) {
        if (!isClicked){
          mouseOverScatter(regionMap.get(d.region));
        }
      })
    .on("mouseleave", function(d) {
        if (!isClicked){
          mouseLeaveScatter();
        }
      })
      .append("title")
      .text(d => "Région : " + regionMap.get(d.region) + "\nAnnée : " + d["year"].getFullYear() + "\n\nTaille des établissements : " + getType("G") + "\nNombre d'établissements : " + d.etab + "\n\n" + getTitle(variable) + " : " + d[var_x] + "\nIndice de fréquentation : " + d[var_y])
  }

    //Création du titre du graphique
  svg.append("text")
    .style("font-size","8px")
    .style("text-anchor", "middle")
    .attr("x", (width + margin.left + margin.right)/2)
    .attr("y", margin.top)
    .text(`Indice de fréquentation en fonction ${getTitle(var_x)} `);

  //Creation du titre de l'axe des abscisses
  svg.append("text")
    .attr("class", "x label")
    .style("font-size","6px")
    .style("text-anchor", "middle")
    .attr("x", (width + margin.left + margin.right)/2)
    .attr("y", height + margin.bottom + 5)
    .text(`${keyMap.get(var_x)} (${unitMap.get(var_x)})`);

  //Creation du titre de l'axe des ordonnees
  svg.append("text")
    .attr("class", "y label")
    .style("font-size","6px")
    .attr("text-anchor", "middle")
    .attr("x", 0)
    .attr("y", 0)
    .attr("transform", `rotate(-90) translate(${-(height + margin.bottom + margin.top)/2 +10},${margin.left-20})`)
    .text("Indice de fréquentation");

  return svg.node();
}


  async function legend_scatterplot() {
  // set the dimensions and margins of the graph
  var margin = {top: 30, right: 10, bottom: 5, left: 5},
      width =260 - margin.left - margin.right,
      height = 200 - margin.top - margin.bottom;

  const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width+margin.left+margin.right, height+margin.top+margin.bottom])
      .attr("width", (width+margin.left+margin.right))
      .attr("height", 2*(height+margin.top+margin.bottom))

  //Préparation données
  let data = await getDataPromise();
  const rawRegion = getValues(data, "region");
  d3.schemePaired.push("#F236BB");
  const color = d3.scaleOrdinal(rawRegion,d3.schemePaired);

  //Contenu de parseRegion
  let france = await getFrancePromise();
  let regions = getValues(getValues(france.features,"properties"),"nom");
  regions.splice(9,5);
  regions.sort((a, b) => a.localeCompare(b));
  //let rawRegion = await getPromiseValues("region");
  let regionMap = buildMap(rawRegion, regions);


  svg.selectAll("rect").data(rawRegion)
    .enter()
    .append("rect")
    .attr("x", margin.left)
    .attr("y", (d, i) => (i-3) * 20 + 25)
    .attr("width", 10)
    .attr("height", 10)
    .attr("fill", d => color(d))
    .attr("stroke", "black")

  svg.selectAll("text").data(rawRegion)
    .enter()
    .append("text")
    .attr("x", margin.left + 15)
    .attr("y", (d, i) => (i-3) * 20 + 35)
    .style("font-size","15px")
    .text(d => regionMap.get(d))//parseRegion(d)) //À corriger !!!!!!!

  return svg.node();
}



console.log(getKey(variable));
let scatter_node = scatterplot(getKey(variable)); // normalement scatterplot(filteredData, getKey(variable))

scatter_node.then((result) => {
  document.getElementById("scatter").appendChild(result);
});


let legend_node = legend_scatterplot();

legend_node.then((result) => {
  document.getElementById("legend").appendChild(result);
});