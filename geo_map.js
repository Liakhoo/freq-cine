async function geo_map(w=600, h=500, g) {
	// initialisation du tooltip  
	const svg = g || d3.create("svg")
      .attr("viewBox", [0, 0, w, h])

	let margin = { top: 10, right: 10, bottom: 10, left: 10 };

	let width = w - margin.left - margin.right,
    height = h - margin.top - margin.bottom;

	let projection = d3.geoConicConformal()
    	.center([2.454071, 46.279229])
    	.scale(2600)
    	.translate([width / 2, height / 2]);

  let path = d3.geoPath(projection);
  //var isClicked = false
 	//var chosen_node = '' // définition de chosen_node pour éviter les erreurs d'exécution
 	//var chosen_region = '' // définition de chosen_region pour éviter les erreurs d'exécution

  //Contenu de parseRegionInverse
  let france = await getFrancePromise();
  let regions = getValues(getValues(france.features,"properties"),"nom");
  regions.splice(9,5);
  regions.sort((a, b) => a.localeCompare(b));
  let rawRegion = await getPromiseValues("region");
  let regionMap = buildMap(regions, rawRegion);

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
      		//tooltipStats.html('<p> Please show up </p>'); 
      		//tooltip.style('opacity', 1).text(d.properties.nom).attr('x', (d3.pointer(e,this)[0]-10)+"px").attr('y',d3.pointer(e,this)[1]+"px").style('visibility','visible');
      		
      		// Gestion couleur
      		if (!isClicked){
      			d3.select(this).style("fill","red").style("cursor","pointer");
      		}
      		else {
      			if(this != chosen_node){
      				// Changement de la couleur de passage du pointeur lorsqu'une région sélectionnée
      				d3.select(this) .style("fill","#ff5a5a").style("cursor","pointer");
      			}
      		}
      	})
    	.on("click", (d,i) => {
      		isClicked = true;
      		
      		//Modification de la carte, remise en gris des régions non sélectionnées
      		let nodes = document.querySelectorAll('path[type="region"]');
      		for (let c of nodes){
        		c.style.fill = "rgb(104,104,104)";
        		c.style.stroke = "#000000";
      		}
      		chosen_node = document.querySelector(`.${d.properties.nom.split(' ').join('-').split("'").join('')}`);
      		chosen_region.push(d.properties.nom);
      		
      		//Changement titre carte
      		let title_node = document.querySelectorAll('.title');
      		//console.log(title_node);
          let nbRegions = chosen_region.length;
          if (nbRegions == 1){
            title_node[0].innerHTML = `La région choisie est : ${chosen_region[0]}`;
          }
          else{
            region_names = chosen_region[0];
            for (let i=1; i < nbRegions - 1; i++){
              region_names += ", " + chosen_region[i];
            }
            region_names += " et " + chosen_region[nbRegions - 1];
            title_node[0].innerHTML = `Les régions choisies sont : ${region_names}`;
          }
      		
      
      		// Coloration en rouge de la région sélectionnée
      		chosen_node.style.fill = "red";
    
      		// Changement de la line chart
      		let q_var = [];
          for (let element of chosen_region){
            q_var.push(regionMap.get(element));
          }
      		let td_node = document.querySelectorAll('#line_chart');  //récupération du td contenant le line chart
      		let svg_node = td_node[0].querySelectorAll('svg'); //recuperation du noeud svg du line chart
          let chart_node = chart(getKey(variable),q_var,"T"); // récupération noeud nouveau line chart
          chart_node.then((result) => {
            td_node[0].replaceChild(result, svg_node[0]);
          });

          //Modification du scatterplot
          mouseOverScatter(d.properties.nom);
      	})
    	.on("mouseleave", function(d) {
      		tooltip.style('opacity', 0).style('visibility','hidden');
      		// Gestion de la couleur
      		if(this != chosen_node){
         		d3.select(this).style("fill","rgb(104,104,104)");
         	}
         })


    svg.append("text")
    	.attr('class','title')
    	.style("font-size","20px")
       	.style("text-anchor", "middle")
       	.attr("x", (w + margin.left + margin.right)/2)
       	.attr("y", h-margin.bottom)
      	.text('Choisissez la région à étudier')
  

  return svg.node();
}





let map_node = geo_map();

map_node.then((result) => {
  document.getElementById("carte").appendChild(result);
});