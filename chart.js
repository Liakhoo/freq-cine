//Creation line chart
async function chart(k = "freq", q = [],type = "T") {
  const margin = ({top: 45, right: 30, bottom: 50, left: 60})
  const height = 350;
  const width = 600;

  //Création du svg
  const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, height])

  //Récupération des données à afficher
  let data = await getDataPromise();
    
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
  }

  //Création du titre du graphique
  svg.append("text")
    .attr("class", "titlebis")
    .style("font-size","20px")
    .style("text-anchor", "middle")
    .attr("x", (width + margin.left + margin.right)/2)
    .attr("y", margin.top/2)
    .text(`${keyMap.get(k)} en fonction du temps`);

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
    .text(`${keyMap.get(k)} ${unitMap.get(k)}`);


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




