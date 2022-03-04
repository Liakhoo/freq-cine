# freq-cine

Ce Github a pour objectif de permettre l'étude des données à propos des cinémas, et plus particulièrement l'impact de plusieurs variables (recettes, nombres de séances ou d'entrées...) sur l'indice de fréquentation des cinémas (correspondant au nombre de places achetées par habitants). L'étude se fait région par région via des représentations graphiques en Javascript, à l'aide du module d3.

Les données étudiées ont été récupérées sur le site du Centre National du Cinéma et de l'image animée (CNC).


## Présentation de la visualisation

Notre graphique principal est un scatterplot (avec sa légende) qui affiche l'indice de fréquentation en fonction d'une autre variable que nous pouvons choisir dans un menu déroulant. Pour chaque point du scatterplot :
- La couleur représente la région
- La taille représente le nombre d'établissements
- La forme représente le type de cinéma cinéma

Plusieurs filtres permettent une analyse plus précise du scatterplot. Il est en effet possible de choisir un ou plusieurs types de cinémas et une année d'étude. Afin de pouvoir suivre l'évolution temporelle, des boutons "play" et "stop" permettent respectivement de lancer une lecture automatique du slider des dates et de l'arrêter. De plus, le survol des éléments du scatterplot permet de mettre en avant les points d'une même région et d'atténuer les autres.

Une analyse plus poussée par région est possible en sélectionnant une région sur la carte située à droite du scatterplot, ce qui va mettre en avant sur le scatterplot les points qui correspondent à la région choisie. Il est possible sur la carte de choisir plusieurs régions. Le bouton "reset" permet de remettre à zéro le choix des régions.

Sous la carte se trouve un line chart représentation l'évolution temporelle de la variable d'étude choisie pour chaque région choisie. Ce line chart ne considère que les totaux pour l'ensemble des établissement de chaque région. Si aucune région n'est choisie sur la carte, le line chart affiche les données pour toutes les régions de France métropolitaine.

## Contenu des fichiers

Les données ont été réaorganisées et se trouvent dans le fichier <tt>freq-cine.csv</tt>.
<br/>Le code HTML du site se trouve dans le fichier <tt>index.html</tt>.
<br/>Le code CSS du site se trouve dans le fichier <tt>dataviz_freqcine_style.css</tt>.

Le code Javascript a été réparti dans plusieurs fichiers :
- <tt>main.js</tt> : contient les fonctions et variables principales, récupère les données qui vont être utilisé (les données de la carte et les données du fichier csv).
- <tt>scatterplot.js</tt> : contient la fonction de création du scatterplot et de sa légende, et leur affichage sur le site.
- <tt>chart.js</tt> : contient la fonction de création du line chart et son affichage sur le site.
- <tt>geo_map.js</tt> : contient la fonction de création de la carte et son affichage sur le site.
- <tt>animation.js</tt> : contient les fonctions et variables permettant une interaction entre les différents graphiques et les filtres.

Enfin, le dossier "image" contient les différentes images que nous avons utilisé sur le site.
