


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
