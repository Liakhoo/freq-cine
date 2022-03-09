//Creation carte
async function geo_map(w=300, h=300, g) {
	// initialisation svg
	const svg = g || d3.create("svg")
      .attr("viewBox", [0, 0, w, h])

	let margin = { top: 10, right: 10, bottom: 10, left: 10 };

	let width = w - margin.left - margin.right,
    height = h - margin.top - margin.bottom;

	let projection = d3.geoConicConformal()
    	.center([2.454071, 46.279229])
    	.scale(1100)
    	.translate([width / 2, height / 2]);

  let path = d3.geoPath(projection);

  //Contenu de parseRegionInverse
  let france = await getFrancePromise();
  let regions = getValues(getValues(france.features,"properties"),"nom");
  regions.splice(9,5);
  regions.sort((a, b) => a.localeCompare(b));
  let rawRegion = await getPromiseValues("region");
  let regionMap = buildMap(regions, rawRegion);

  //initialisation du tooltip
 	var tooltip = d3.select("#carte")
    	.append('div')
      .attr('class','tooltip')
      .style('opacity',0)
  	
    //Carte de la France
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
    	.on("mouseover", function(d) {
          var mouse = d3.mouse(this);
      		// Création tooltip
          //tooltip.attr("transform", "translate("+ (mouse[0]-10) + "," + (mouse[1] - 10) + ")"); 
      		tooltip.style('opacity', 1).text(d.properties.nom).style('visibility','visible');
      		
      		// Gestion couleur
      		if (!isClicked){
      			d3.select(this).style("fill","red").style("cursor","pointer");
      		}
      		else {
      			if(!chosen_node.includes(this)){
      				// Changement de la couleur de passage du pointeur lorsqu'une région sélectionnée
      				d3.select(this) .style("fill","#ff5a5a").style("cursor","pointer");
      			}
      		}
      	})
    	.on("click", (d,i) => {
        if(!chosen_region.includes(d.properties.nom)){
      		isClicked = true;
      		
      		//Modification de la carte, remise en gris des régions non sélectionnées
      		let nodes = document.querySelectorAll('path[type="region"]');
      		for (let c of nodes){
        		c.style.fill = "rgb(104,104,104)";
        		c.style.stroke = "#000000";
      		}
      		chosen_region.push(d.properties.nom);
          chosen_node.push(document.querySelector(`.${d.properties.nom.split(' ').join('-').split("'").join('')}`));
      		
      		
      
      		// Coloration en rouge de la région sélectionnée
          for (let node of chosen_node){
            node.style.fill = "red";
          }
      		
    
      		// Modification du line chart
          let variable_node = document.getElementById('VarSelect');
          let variable = variable_node.value;
      		let q_var = [];
          for (let element of chosen_region){
            q_var.push(regionMap.get(element));
          }
      		let td_node = document.querySelectorAll('#line_chart');  //récupération du td contenant le line chart
      		let svg_node = td_node[0].querySelectorAll('svg'); //recuperation du noeud svg du line chart
          console.log(q_var);
          let chart_node = chart(getKey(variable),q_var,"T"); // récupération noeud nouveau line chart
          chart_node.then((result) => {
            td_node[0].replaceChild(result, svg_node[0]);
          });

          //Modification du scatterplot
          mouseOverScatter(d.properties.nom);
        }
      })
    	.on("mouseleave", function(d) {
      		tooltip.style('opacity', 0).style('visibility','hidden');
      		// Gestion de la couleur
      		if(!chosen_node.includes(this)){
         		d3.select(this).style("fill","rgb(104,104,104)");
         	}
         })  

  return svg.node();
}




//Affichage carte
let map_node = geo_map();

map_node.then((result) => {
  document.getElementById("carte").appendChild(result);
});