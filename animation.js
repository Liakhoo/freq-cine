//Variables
var myTimer;

let checkbox_P = document.getElementById('petit');
let checkbox_M = document.getElementById('moyen');
let checkbox_G = document.getElementById('grand');


// Variable d'etude
let options = ["Nombre d'entrées","Nombre d'établissements","Nombre d'écrans","Nombre de fauteuils","Nombre de séances","Recette","Recette moyenne par entrée","Taux moyen d'occupation des fauteuils"].map(d => `<option value="${d}">${d}</option>`);
let variable_node = document.getElementById('VarSelect');

for (option of options){
  variable_node.innerHTML += option;
}

let variable = variable_node.value;


//Evenements
checkbox_P.addEventListener('change', () => {modify_scatter();modify_legend();});
checkbox_M.addEventListener('change', () => {modify_scatter();modify_legend();});
checkbox_G.addEventListener('change', () => {modify_scatter();modify_legend();});


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
      var t = (+b.property("value") + 1) % (+b.property("max") + 1);
      if (t == 0) {
        t = +b.property("min");
      }
      b.property("value", t);
      modify_scatter();
    }, 1000);
});

d3.select("#stop").on("click", function() {
  clearInterval (myTimer);
});



d3.select("#reset").on("click",function () {
  let variable_node = document.getElementById('VarSelect');
  let variable = variable_node.value;

  //Réinitialisation carte
  let map_node = document.querySelector("#carte").querySelector("svg")
  let nodes = map_node.querySelectorAll('path[type="region"]');
      for (let c of nodes){
        c.style.fill = "rgb(104,104,104)";
        c.style.stroke = "#000000";
      }

  //Mise à jour line chart
  let q_var = [];
  let td_node = document.querySelectorAll('#line_chart');  //récupération du td contenant le line chart
  let svg_node = td_node[0].querySelectorAll('svg'); //recuperation du noeud svg du line chart
  let chart_node = chart(getKey(variable),q_var,"T"); // récupération noeud nouveau line chart
  chart_node.then((result) => {
    td_node[0].replaceChild(result, svg_node[0]);
  });

  //Mise à jour scatterplot
  mouseLeaveScatter();

  //Réinitialisation variables
  isClicked = false;
  chosen_node = [];
  chosen_region = [];
});


//Fonctions
function modify_scatter() {
  let td_node = document.querySelectorAll('#scatter');  //récupération du div contenant le scatterplot
  let svg_node = td_node[0].querySelectorAll('svg'); //recuperation du noeud svg du scatterplot

  let variable_node = document.getElementById('VarSelect');
  let variable = variable_node.value;

  scatterplot(getKey(variable), "freq", true);

  /*let scatter_node = scatterplot(getKey(variable)); //Nouveau scatterplot
  scatter_node.then((result) => {
    td_node[0].replaceChild(result, svg_node[0]); // mise à jour du scatterplot
  });*/
};

function modify_legend() {
  let td_node = document.querySelectorAll('#legend_form');  //récupération du div contenant le scatterplot
  let svg_node = td_node[0].querySelectorAll('svg'); //recuperation du noeud svg du scatterplot

  let legend_node = legend_form();
  legend_node.then((result) => {
    td_node[0].replaceChild(result, svg_node[0]); // mise à jour du scatterplot
  });
}


async function modify_linechart() {
  let td_node = document.querySelectorAll('#line_chart');  //récupération du div contenant le scatterplot
  let svg_node = td_node[0].querySelectorAll('svg'); //recuperation du noeud svg du scatterplot

  let variable_node = document.getElementById('VarSelect');
  let variable = variable_node.value;

  let choice = [];
  for (let element of chosen_region){
    res = await parseRegionInverse(element);
    choice.push(res);
  }
  console.log(choice);

  let scatter_node = chart(getKey(variable), choice); //Nouveau scatterplot
  scatter_node.then((result) => {
    td_node[0].replaceChild(result, svg_node[0]); // mise à jour du scatterplot
  });
};