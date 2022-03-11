//Creation line chart
async function chart(k = "freq", q = [],type = "T") {
  const margin = ({top: 45, right: 30, bottom: 50, left: 60})
  const height = 250;
  const width = 600;

  //Création du tooltip
  var tooltip = d3.select("#line_chart")
      .append('div')
      .attr('class','tooltip')
      .style('opacity',0)
      .style('text-align',"left")
      .style("width","150px")

  //Création du svg
  const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, height])

  //Récupération des données à afficher
  let data = await getDataPromise();
  let data_film = await getDataPromise2();

  let variable_node = document.getElementById('VarSelect');
  let variable = variable_node.value;
    
  d3.schemePaired.push("#F236BB");
  const rawRegion = getValues(data, "region");
  const color = d3.scaleOrdinal(rawRegion,d3.schemePaired);

  var dataValue;
  var rawYear;
  var regionName;
  //Pré-traitement régions étudiées
  if (q.length == 0){ //Cas ou aucune region n'est selectionnee
    q = await getPromiseValues("region");
    var newdataset = data.filter(d => d.type == type);
    newdataset = newdataset.filter(d => d[k] != 0);
    dataValue = getValues(newdataset,k);
    rawYear = getValues(newdataset, "year").sort();
    regionName = "Choisissez une région pour commencer l'analyse";

  }
  else{
    var newdataset = data.filter(d => q.includes(d.region));
    newdataset = newdataset.filter(d => d.type == type);
    newdataset = newdataset.filter(d => d[k] != 0);
    dataValue = getValues(newdataset,k);
    rawYear = getValues(newdataset, "year").sort();
    if (q.length == 1){ //une seule region selectionnee
      let name = await parseRegion(q[0]);
      regionName = `Région sélectionnée : ${name}`;
    }
    else{ //Plusieurs regions selectionnees 
      let region_names = await parseRegion(q[0]);
      for (let i=1; i < q.length - 1; i++){
        let name = await parseRegion(q[i])
        region_names += ", " + name;
      }
      name = await parseRegion(q[q.length - 1]);
      region_names += " et " + name;
      regionName = `Régions sélectionnées : ${region_names}`
    }  
  }

  //Changement titre tableau
  let title_node = document.getElementById('title');
  title_node.innerHTML = `${regionName}`;

  //Mise à l'échelle de l'axe des abscisses
  const x = d3.scaleTime()
    .domain(d3.extent([parseDate(rawYear[0]),parseDate(rawYear[rawYear.length-1])]))
    .range([margin.left, width - margin.right])
  
  //Mise à l'échelle de l'axe des ordonnées
  const y = d3.scaleLinear()
    .domain([d3.max(dataValue), 0])
    .range([margin.top, height - margin.bottom])

  //Création fonction de la ligne
  let line = d3.line()
    .x((d, i) => x(d.year)-margin.left)
    .y(d => y(d[k]))


  let dataset;
  //Création des lignes
  for (region of q){
    dataset = data.filter(d => d.region == region);
    dataset = dataset.filter(d => d.type == type);
    dataset = dataset.filter(d => d[k] != 0);

    svg.append("g").attr("transform", `translate(${margin.left}, 0)`).selectAll("path")
    .data([dataset])
    .enter()
    .append("path")
    .attr("d", d => line(d))
    .attr("fill", "none")
    .attr("stroke-width", d => (isClicked && region == q[q.length-1]) ? "3" : "1")
    .attr("stroke", d => color(region))

    svg.append("g").attr("transform", `translate(${margin.left}, 0)`).selectAll("circle")
      .data(dataset)
      .enter()
      .append("circle")
      .attr("cx",(d,i) => x(d.year)-margin.left)
      .attr("cy",d=> y(d[k]))
      .attr("r",4)
      .style("fill","#fff")
      .style("opacity",0)
      .style("stroke",d => color(region))
      .on("mouseover", function(d,i) {
        // affichage cercle
        d3.select(this).style("opacity",1)

        if (k=="entrees"){
          //Récupération des données de film
          nom = data_film[i].nom
          annee = data_film[i].year.getFullYear()
          real = data_film[i].real
          entrees = data_film[i].entree

          //Ajout du tooltip
          tooltip.style("opacity",1)
                .html("<strong>Film numéro 1 de l'année en France</strong>" + "<br/>" + "<br/>" + "Nom : " + nom + "<br/>" + "Réalisateur : " + real + "<br/>" + "Année : " + annee + "<br/>" + "Entrées : " + entrees + unitMap.get("entrees"))
                .style('visibility','visible').style("left", (d3.event.pageX-170) + "px").style("top", (d3.event.pageY) + "px");
        }
        else {
          //Ajout du tooltip
          tooltip.style("opacity",1)
                .html("Année : " + d["year"].getFullYear() + "<br/>" + variable + " : " + d[k] + unitMap.get(k))
                .style('visibility','visible').style("left", (d3.event.pageX-170) + "px").style("top", (d3.event.pageY) + "px");
        }
      })
      .on("mouseleave", function(d) {
        //Disparition du cercle
        d3.select(this).style("opacity",0)

        //Disparition du tooltip
        tooltip.style('opacity', 0).style('visibility','hidden');
      })
  }

  //Création du titre du graphique
  svg.append("text")
    .attr("class", "titlebis")
    .style("font-size","15px")
    .style("text-anchor", "middle")
    .attr("x", (width + margin.left + margin.right)/2)
    .attr("y", margin.top/2)
    .text(`${keyMap.get(k)} en fonction du temps`);

  //Création du titre des axes
  var unit = unitMap.get(k) != "" ? `(en ${unitMap.get(k)})` : "";

  svg.append("text")
    .attr("class", "x label")
    .style("font-size","15px")
    .style("text-anchor", "middle")
    .attr("x", (width + margin.left + margin.right)/2)
    .attr("y", height - 15)
    .text("Année");

  svg.append("text")
    .attr("class", "y label")
    .style("font-size","10px")
    .attr("text-anchor", "middle")
    .attr("x", margin.top)
    .attr("y", margin.left-55)
    .attr("transform", `rotate(-90) translate(${-(height + margin.bottom + margin.top)/2 +10},10)`)
    .text(`${keyMap.get(k)} ${unit}`);


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

  return svg.node();
};

//Affichage line chart
let chart_node = chart(getKey(variable));

chart_node.then((result) => {
  document.getElementById("line_chart").appendChild(result);
});




