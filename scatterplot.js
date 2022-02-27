async function legend_scatterplot() {
  // set the dimensions and margins of the graph
  var margin = {top: 30, right: 60, bottom: 5, left: 5},
      width =450 - margin.left - margin.right,
      height = 200 - margin.top - margin.bottom;

  const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width+margin.left+margin.right, height+margin.top+margin.bottom])
      .attr("width", 2*(width+margin.left+margin.right))
      .attr("height", 2*(height+margin.top+margin.bottom))

  //Préparation données
  let data = await getDataPromise();
  const rawRegion = getValues(data, "region");
  d3.schemePaired.push("#F236BB")
  const color = d3.scaleOrdinal(d3.schemePaired);


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




let legend_node = legend_scatterplot();

legend_node.then((result) => {
  document.getElementById("legend").appendChild(result);
});