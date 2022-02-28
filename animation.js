//Variables
let checkbox_P = document.getElementById('petit');
let checkbox_M = document.getElementById('moyen');
let checkbox_G = document.getElementById('grand');

let myTimer;


// Variable selector
let options = ["Nombre d'entrées","Nombre d'établissements","Nombre d'écrans","Nombre de fauteuils","Nombre de séances","Recette","Recette moyenne par entrée","Taux moyen d'occupation des fauteuils"].map(d => `<option value="${d}">${d}</option>`);
let variable_node = document.getElementById('VarSelect');

for (option of options){
  variable_node.innerHTML += option;
}

let variable = variable_node.value;
console.log(variable);



//Evenements
checkbox_P.addEventListener('change', () => {modify_scatter();});
checkbox_M.addEventListener('change', () => {modify_scatter();});
checkbox_G.addEventListener('change', () => {modify_scatter();});



d3.select("#VarSelect").on("change", function() {
  modify_scatter();
  modify_linechart();
});

d3.select("#rangeSlider").on("input", function() {
  modify_scatter();
});


d3.select("#start").on("click", function() {
  clearInterval (myTimer);
  myTimer = setInterval (function() {
      var b= d3.select("#rangeSlider");
      console.log(b);
      var t = (+b.property("value") + 1) % (+b.property("max") + 1);
      console.log(t)
      if (t == 0) {
        t = +b.property("min");
      }
      b.property("value", t);
      modify_scatter();
    }, 1000);
  console.log(myTimer);
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


//Partie stop non fonctionnelle encore !
d3.select("#stop").on("click", function(myTimer) {
  console.log(myTimer);
  clearInterval (myTimer);
});


//Fonctions
modify_scatter = () => {
  let td_node = document.querySelectorAll('#scatter');  //récupération du div contenant le scatterplot
  let svg_node = td_node[0].querySelectorAll('svg'); //recuperation du noeud svg du scatterplot

  let variable_node = document.getElementById('VarSelect');
  let variable = variable_node.value;

  let scatter_node = scatterplot(getKey(variable)); //Nouveau scatterplot
  scatter_node.then((result) => {
    td_node[0].replaceChild(result, svg_node[0]); // mise à jour du scatterplot
  });
};


modify_linechart = () => {
  let td_node = document.querySelectorAll('#line_chart');  //récupération du div contenant le scatterplot
  let svg_node = td_node[0].querySelectorAll('svg'); //recuperation du noeud svg du scatterplot

  let variable_node = document.getElementById('VarSelect');
  let variable = variable_node.value;

  let scatter_node = chart(getKey(variable)); //Nouveau scatterplot
  scatter_node.then((result) => {
    td_node[0].replaceChild(result, svg_node[0]); // mise à jour du scatterplot
  });
};