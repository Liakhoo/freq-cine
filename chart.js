



async function chart(k = "freq", q = ["ILE-DE-FRANCE","OCCITANIE"],type = "T") {
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


  //Récupération des données à afficher
  let data = await getDataPromise();
  var newdataset = data.filter(d => d.region == q[0]);
  newdataset = newdataset.filter(d => d.type == type);
  const dataValue = getValues(newdataset,k);
  const rawYear = getValues(data, "year").sort();
  let regionName = await parseRegion(q[0]);
  
  d3.schemePaired.push("#F236BB")
  const color = d3.scaleOrdinal(d3.schemePaired)

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


  let dataset;
  //Création des lignes
  for (region of q){
    console.log(region);
    dataset = data.filter(d => d.region == region);
    dataset = dataset.filter(d => d.type == type);

    svg.append("g").attr("transform", `translate(${margin.left}, 0)`).selectAll("path")
    .data([dataset])
    .enter()
    .append("path")
    .attr("d", d => line(d))
    .attr("fill", "none")
    .attr("stroke", d => "blue")
  }

  //Création du titre du graphique
  svg.append("text")
    .attr("class", "titlebis")
    .style("font-size","20px")
    .style("text-anchor", "middle")
    .attr("x", (width + margin.left + margin.right)/2)
    .attr("y", margin.top/3)
    .text(`${keyMap.get(k)} de la région : ${regionName}`);

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

  return svg.node();
};

let chart_node = chart(getKey(variable));

chart_node.then((result) => {
  document.getElementById("line_chart").appendChild(result);
});




