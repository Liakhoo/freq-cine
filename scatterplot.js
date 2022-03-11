//Creation scatterplot
async function scatterplot(var_x = "entrees", var_y = "freq", update=false) {
  // set the dimensions and margins of the graph
  var margin = {top: 30, right: 0, bottom: 10, left: 50},
      width = 550 - margin.left - margin.right,
      height = 300 - margin.top - margin.bottom;

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

  let variable_node = document.getElementById('VarSelect');
  let variable = variable_node.value;

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

  //Création du tooltip
  var tooltip = d3.select("#scatter")
      .append('div')
      .attr('id','tooltip_scatter')
      .attr('class','tooltip')
      .style('opacity',0)
      .style('text-align',"left")

  //Contenu de parseRegion
  let france = await getFrancePromise();
  let regions = getValues(getValues(france.features,"properties"),"nom");
  regions.splice(9,5);
  regions.sort((a, b) => a.localeCompare(b));
  const rawRegion = getValues(data, "region");
  let regionMap = buildMap(rawRegion, regions);

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

  d3.schemePaired.push("#F236BB");
  //const rawRegion = getValues(data, "region");
  const color = d3.scaleOrdinal(rawRegion,d3.schemePaired);


  var unit = unitMap.get(var_x) != "" ? `(en ${unitMap.get(var_x)})` : "";



  if (update) {
    d3.select("#scatter").selectAll(".xAxis")
    .transition()
    .duration(1000)
    .call(d3.axisBottom().scale(x));

    d3.select("#scatter").selectAll(".yAxis")
      .transition()
      .duration(1000)
      .call(d3.axisLeft(y));

    d3.select("#scatter").selectAll(".x_label")
      .transition()
      .duration(1000)
      .text(`${keyMap.get(var_x)} ${unit}`);

    d3.select("#scatter").selectAll(".year")
      .transition()
      .duration(1000)
      .text(`${date}`);

    d3.select("#scatter").selectAll(".scatter_title")
      .transition()
      .duration(1000)
      .text(`Indice de fréquentation en fonction ${getTitle(var_x)}`);


    //Points
    let circles = d3.select("#scatter").selectAll("circle").data(newdataset_P);

    circles.enter()
    .append("circle")
    .merge(circles)
    .transition()
    .duration(1000)
    .attr("cx", d => x(d[var_x]))
    .attr("cy", d => y(d[var_y]))
    .attr("r", d => taille(d["etab"]))
    .attr("display", d => document.querySelector('#petit').checked ? "inherit" : "none")

    //Update tooltip
    circles.enter()
    .append("circle")
    .merge(circles)
    .on("mouseover", function(d) {
      //affichage du tooltip
      tooltip.style('opacity', 1)
            .html("Région : "+ regionMap.get(d.region) + "<br/>" + "Année : " + d["year"].getFullYear() + "<br/>" + "<br/>" + "Taille des établissements : " + getType("P") + "<br/>" + "Nombre d'établissements : " + d.etab + "<br/>" +"<br/>" + variable + " : " + d[var_x] + unitMap.get(var_x) + "<br/>" + "Indice de fréquentation : " + d[var_y])
            .style('visibility','visible').style("left", (d3.event.pageX+20) + "px").style("top", (d3.event.pageY) + "px");

        if (!isClicked){
          mouseOverScatter(regionMap.get(d.region));
        }
      })
    .on("mouseleave", function(d) {
      tooltip.style('opacity', 0).style('visibility','hidden');
        if (!isClicked){
          mouseLeaveScatter();
        }
      })
    

    //Carrés
    let rects = d3.select("#scatter").selectAll("rect").data(newdataset_M);

    rects.enter()
    .append("rect")
    .merge(rects)
    .transition()
    .duration(1000)
    .attr("x", d => x(d[var_x]) - taille(d["etab"]))
    .attr("y", d => y(d[var_y]) - taille(d["etab"]))
    .attr("height", d => 2*taille(d["etab"]))
    .attr("width", d => 2*taille(d["etab"]))
    .attr("display", d => document.querySelector('#moyen').checked ? "inherit" : "none")

    //Update tooltip
    rects.enter()
    .append("rect")
    .merge(rects)
    .on("mouseover", function(d) {
      //affichage du tooltip
      tooltip.style('opacity', 1)
            .html("Région : "+ regionMap.get(d.region) + "<br/>" + "Année : " + d["year"].getFullYear() + "<br/>" + "<br/>" + "Taille des établissements : " + getType("M") + "<br/>" + "Nombre d'établissements : " + d.etab + "<br/>" +"<br/>" + variable + " : " + d[var_x] + unitMap.get(var_x) + "<br/>" + "Indice de fréquentation : " + d[var_y])
            .style('visibility','visible').style("left", (d3.event.pageX+20) + "px").style("top", (d3.event.pageY) + "px");

        if (!isClicked){
          mouseOverScatter(regionMap.get(d.region));
        }
      })
    .on("mouseleave", function(d) {
      tooltip.style('opacity', 0).style('visibility','hidden');
        if (!isClicked){
          mouseLeaveScatter();
        }
      })
    

    //Triangles
    let poly = d3.select("#scatter").selectAll("polygon").data(newdataset_G);

    poly.enter()
    .append("polygon")
    .merge(poly)
    .transition()
    .duration(1000)
    .attr("points", d => {
            return String(x(d[var_x]) - taille(d["etab"])) + "," + String(y(d[var_y]) + taille(d["etab"])) + " " + String(x(d[var_x])) + "," + String(y(d[var_y]) - taille(d["etab"])) + " " + String(x(d[var_x]) + taille(d["etab"])) + "," + String(y(d[var_y]) + taille(d["etab"]));
    })
    .attr("display", d => document.querySelector('#grand').checked ? "inherit" : "none")

    //Update tooltip
    poly.enter()
    .append("polygon")
    .merge(poly)
    .on("mouseover", function(d) {
      //affichage du tooltip
      tooltip.style('opacity', 1)
            .html("Région : "+ regionMap.get(d.region) + "<br/>" + "Année : " + d["year"].getFullYear() + "<br/>" + "<br/>" + "Taille des établissements : " + getType("G") + "<br/>" + "Nombre d'établissements : " + d.etab + "<br/>" +"<br/>" + variable + " : " + d[var_x] + unitMap.get(var_x) + "<br/>" + "Indice de fréquentation : " + d[var_y])
            .style('visibility','visible').style("left", (d3.event.pageX+20) + "px").style("top", (d3.event.pageY) + "px");

        if (!isClicked){
          mouseOverScatter(regionMap.get(d.region));
        }
      })
    .on("mouseleave", function(d) {
      tooltip.style('opacity', 0).style('visibility','hidden');
        if (!isClicked){
          mouseLeaveScatter();
        }
      })

    return 0;
  }



  //Axes
  let xAxis = g => g
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .style("font-size","5px")
    .attr("class","xAxis")
    .call(d3.axisBottom(x))

  let yAxis = g => g
      .attr("transform", `translate(${margin.left},0)`)
      .style("font-size","5px")
      .attr("class","yAxis")
      .call(d3.axisLeft(y))

  svg.append("g")
      .call(xAxis);

  svg.append("g")
      .call(yAxis);

  //Année
  svg.append("text")
    .attr("class", "year")
    .style("font-size","50px")
    .attr("fill","#c6c6c6")
    .attr("text-anchor", "middle")
    .attr("x", margin.left + 3*width/4)
    .attr("y", margin.top + 4*height/5)
    .text(`${date}`);



  //Points
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
      //affichage du tooltip
      tooltip.style('opacity', 1)
            .html("Région : "+ regionMap.get(d.region) + "<br/>" + "Année : " + d["year"].getFullYear() + "<br/>" + "<br/>" + "Taille des établissements : " + getType("P") + "<br/>" + "Nombre d'établissements : " + d.etab + "<br/>" +"<br/>" + variable + " : " + d[var_x] + unitMap.get(var_x) + "<br/>" + "Indice de fréquentation : " + d[var_y])
            .style('visibility','visible').style("left", (d3.event.pageX+20) + "px").style("top", (d3.event.pageY) + "px");

        if (!isClicked){
          mouseOverScatter(regionMap.get(d.region));
        }
      })
    .on("mouseleave", function(d) {
      tooltip.style('opacity', 0).style('visibility','hidden');
        if (!isClicked){
          mouseLeaveScatter();
        }
      })
    .append("title") 
    
  
  //Carrés
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
        //affichage du tooltip
        tooltip.style('opacity', 1)
              .html("Région : " + regionMap.get(d.region) + "<br/>" + "Année : " + d["year"].getFullYear() + "<br/>" + "<br/>" + "Taille des établissements : " + getType("M") + "<br/>" + "Nombre d'établissements : " + d.etab + "<br/>" + "<br/>" + variable + " : " + d[var_x] + unitMap.get(var_x) + "<br/>" + "Indice de fréquentation : " + d[var_y])
              .style('visibility','visible').style("left", (d3.event.pageX+20) + "px").style("top", (d3.event.pageY) + "px");
        if (!isClicked){
          mouseOverScatter(regionMap.get(d.region));
        }
      })
    .on("mouseleave", function(d) {
      tooltip.style('opacity', 0).style('visibility','hidden');
        if (!isClicked){
          mouseLeaveScatter();
        }
      })
      .append("title")
  

  //Triangles
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
        //affichage du tooltip
        tooltip.style('opacity',1)
              .html("Région : " + regionMap.get(d.region) + "<br/>" + "Année : " + d["year"].getFullYear() + "<br/>" + "<br/>" + "Taille des établissements : " + getType("G") + "<br/>" + "Nombre d'établissements : " + d.etab + "<br/>" + "<br/>" + variable + " : " + d[var_x] + unitMap.get(var_x) + "<br/>" + "Indice de fréquentation : " + d[var_y])
              .style('visibility','visible').style("left", (d3.event.pageX+20) + "px").style("top", (d3.event.pageY) + "px");
        if (!isClicked){
          mouseOverScatter(regionMap.get(d.region));
        }
      })
    .on("mouseleave", function(d) {
      tooltip.style('opacity',0).style('visibility','hidden')
        if (!isClicked){
          mouseLeaveScatter();
        }
      })
      .append("title")
  

  //Création du titre du graphique
  svg.append("text")
    .style("font-size","15px")
    .style("text-anchor", "middle")
    .attr("class", "scatter_title")
    .attr("x", (width + margin.left + margin.right)/2)
    .attr("y", margin.top-15)
    .text(`Indice de fréquentation en fonction ${getTitle(var_x)} `);

  //Creation du titre de l'axe des abscisses
  svg.append("text")
    .attr("class", "x_label")
    .style("font-size","10px")
    .style("text-anchor", "middle")
    .attr("x", (width + margin.left + margin.right)/2)
    .attr("y", height + margin.bottom + 5)
    .text(`${keyMap.get(var_x)} ${unit}`);

  //Creation du titre de l'axe des ordonnees
  svg.append("text")
    .attr("class", "y-label")
    .style("font-size","10px")
    .attr("text-anchor", "middle")
    .attr("x", 0)
    .attr("y", -5)
    .attr("transform", `rotate(-90) translate(${-(height + margin.bottom + margin.top)/2 +10},${margin.left-20})`)
    .text("Indice de fréquentation");

  return svg.node();
}

//Creation légende de couleur
async function legend_scatterplot() {
  // set the dimensions and margins of the graph
  var margin = {top: 0, right: 10, bottom: 5, left: 5},
      width =260 - margin.left - margin.right,
      height = 280 - margin.top - margin.bottom;

  const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width+margin.left+margin.right, height+margin.top+margin.bottom])
      /*.attr("width", (width+margin.left+margin.right))
      .attr("height", 2*(height+margin.top+margin.bottom))*/

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
    .attr("y", (d, i) => i*20 + 10)
    .attr("width", 10)
    .attr("height", 10)
    .attr("fill", d => color(d))
    .attr("stroke", "black")

  svg.selectAll("text").data(rawRegion)
    .enter()
    .append("text")
    .attr("x", margin.left + 15)
    .attr("y", (d, i) => i*20 + 20)
    .style("font-size","15px")
    .text(d => regionMap.get(d))//parseRegion(d)) //À corriger !!!!!!!

  return svg.node();
}

//Creation legende taille
async function legend_form() {
  //dimension et marges de la légende
  var margin = {top: 20, right: 5, bottom: 5, left: 5},
      width =260 - margin.left - margin.right,
      height = 60 - margin.top - margin.bottom;

  const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width+margin.left+margin.right, height+margin.top+margin.bottom])

  //Préparation données
  let date = d3.select("#rangeSlider").property("value");
  let choices = chosen_region[chosen_region.length-1]

  let data = await getDataPromise();
  let dataset = filterTaille(data);
  let newdataset = dataset.filter(d => d.year.toDateString() === parseDate(date).toDateString());

  let dataset_P = dataset.filter(d => d.type === "P");
  let dataset_M = dataset.filter(d => d.type === "M");
  let dataset_G = dataset.filter(d => d.type === "G");
  
  let newdataset_P = newdataset.filter(d => d.type === "P");
  let newdataset_M = newdataset.filter(d => d.type === "M");
  let newdataset_G = newdataset.filter(d => d.type === "G");

  //Fonction pour avoir min, max et médian
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
    return [min_P,min_M,min_G];
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
    return [max_P, max_M, max_G];
  }

  function calculateMoy(dataset,dataP, dataM, dataG, key) {
    let moy_P = 0
    let moy_M = 0
    let moy_G = 0
    if (document.querySelector('#petit').checked){
      moy_P = d3.mean(dataP, d => d[key]);
    }
    if (document.querySelector('#moyen').checked){
      moy_M = d3.mean(dataM, d => d[key]);
    }
    if (document.querySelector('#grand').checked){
      moy_G = d3.mean(dataG, d => d[key]);
    }
    //recalcule de la moyenne en enlevant les tailles non sélectionnées
    var moy_list = [moy_P,moy_M,moy_G]
    moy_list.sort((a,b)=>a-b)
    while (moy_list[0]==0 && moy_list!=[]){
      moy_list.splice(0,1)
    }
    let moy_tot = d3.mean(moy_list)
    return moy_tot;
  }

  
  let global_lim = [d3.min(calculateMin(data,dataset_P,dataset_M,dataset_G,"etab")),Math.round(calculateMoy(data,dataset_P,dataset_M,dataset_G,"etab")),d3.max(calculateMax(dataset_P,dataset_M,dataset_G,"etab"))]
  let lim_list = ["Minimum","Moyenne","Maximum"]

  //Pour les tailles
  const taille = d3.scaleLinear()
      .domain([global_lim[0], global_lim[2]])
      .range([1, 10])

  //échelle globale  
    svg.selectAll("circle").data(global_lim)
      .enter()
      .append("circle")
      .attr("cx", margin.left+35)
      .attr("cy", d => height+15-taille(d))
      .attr("r", d => taille(d))
      .attr("fill","none")
      .attr("stroke", "black")
      .style("opacity","1")

    svg.selectAll("text").data(global_lim)
      .enter()
      .append("text")
      .attr("x", margin.left+80)
      .attr("y", (d,i) => height - i*15 + 20)
      .style("font-size","15px")
      .text((d,i) => lim_list[i] + " : " + String(d))

  return svg.node();
}

//Affichage du scatterplot et des légendes associees

let scatter_node = scatterplot(getKey(variable)); // normalement scatterplot(filteredData, getKey(variable))

scatter_node.then((result) => {
  document.getElementById("scatter").appendChild(result);
});


let legend_node = legend_scatterplot();

legend_node.then((result) => {
  document.getElementById("legend").appendChild(result);
});

let legend_form_node = legend_form();

legend_form_node.then((result) => {
  document.getElementById("legend_form").appendChild(result);
});