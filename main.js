//import * as d3 from "https://cdn.skypack.dev/d3@7";
/*d3
  .select(".target")  // select the elements that have the class 'target'
  .style("stroke-width", 10) // change their style: stroke width is not equal to 8 pixels*/


//importation des données
let url = "https://raw.githubusercontent.com/Lyspa/freq-cine/main/freq-cine.csv";


let data = d3.csv(url, d => {
  let res = {};
  res.region = d["region"];
  return res;
});


/*let data = d3.csv(url, function(donnees) {
	  	let res = [];
		for (let d of donnees){
			row = {}
	  		//console.log(d);
	  		row.region = d["region"];
	  		res.push(row);
	  	}
  console.log(res)
  return res;
});
*/

//var size = Object.keys(data);
//console.log(size);

console.log(data)