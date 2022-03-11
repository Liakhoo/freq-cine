# Fréquentation et recette des cinémas en France

Autrices : Camille BUISSON et Céline RAILLÉ

Lien vers le site de présentation : https://lyspa.github.io/freq-cine/

Ce Github a pour objectif de permettre l'étude des données à propos des cinémas, et plus particulièrement l'impact de plusieurs variables (recettes, nombres de séances ou d'entrées...) sur l'indice de fréquentation des cinémas (correspondant au nombre de places achetées par habitants). L'étude se fait région par région via des représentations graphiques en Javascript, à l'aide du module d3.

## Présentation des données

Les données sont tirées du site du **Centre National du Cinéma et de l'image animée (CNC)**. Elles rassemblent les statistiques de plusieurs indicateurs par région selon le type d'établissements (petit (i.e moins de 80 000 entrées annuelles), moyen (i.e entre 80 000 et 450 000 entrée annuelles), grand (i.e plus de 450 000 entrées annuelles) ou l'ensemble des établissements). Le détail pour les cinémas d'Art et Essai est également précisé.

Les indicateurs contenus dans les données sont :
- le nombre d'établissements
- le nombre d'écrans
- le nombre de fauteuils
- le nombre de séances
- le nombre d'entrées
- le montant des recettes guichets
- le montant de la recette moyenne par entrée (= recette / entrées)
- l'indice de fréquentation (= entrées / population)
- le taux d'occupation des fauteuils (= entrées / (fauteuils * séances) )

Les relevés généraux pour une région sont accessibles depuis 1992 pour le nombre d'établissements et le nombre de séances, 1966 pour les autres indicateurs. Cependant la répartition par taille d'établissement n'est réalisée que depuis 2004.

Le fichier de données initial est disponible [ici](https://www.cnc.fr/professionnels/etudes-et-rapports/statistiques/statistiques-par-secteur) et s'intitule "Données par région". Ce fichier Excel a été retravaillé avec Python afin de pouvoir extraire, pour chaque région, les données correspondant au type "petit", "moyen", "grand" et "total" et de les stocker dans un fichier csv pouvant être facilement exploité.


## Présentation de la visualisation

Notre graphique principal est un scatterplot (avec sa légende) qui affiche l'indice de fréquentation en fonction d'une autre variable que nous pouvons choisir dans un menu déroulant. Pour chaque point du scatterplot :
- La couleur représente la région
- La taille représente le nombre d'établissements
- La forme représente le type de cinéma

Plusieurs filtres permettent une analyse plus précise du scatterplot. Il est en effet possible de choisir un ou plusieurs types de cinémas et une année d'étude. Afin de pouvoir suivre l'évolution temporelle, des boutons "play" et "stop" permettent respectivement de lancer une lecture automatique du slider des dates et de l'arrêter. De plus, le survol des éléments du scatterplot permet de mettre en avant les points d'une même région et d'atténuer les autres.

Une analyse plus poussée par région est possible en sélectionnant une région sur la carte située à droite du scatterplot, ce qui va mettre en avant sur le scatterplot les points qui correspondent à la région choisie. Il est possible sur la carte de choisir plusieurs régions. Le bouton "reset" permet de remettre à zéro le choix des régions.

Sous la carte se trouve un line chart représentant l'évolution temporelle de la variable d'étude choisie pour chaque région choisie. Ce line chart ne considère que les totaux pour l'ensemble des établissement de chaque région. Si aucune région n'est choisie sur la carte, le line chart affiche les données pour toutes les régions de France métropolitaine.

Ci-dessous ce trouve le prototype papier auquel nous avons pensé (il est possible qu'il diffère légèrement du produit final).
![alt text](https://www.zupimages.net/up/22/10/0ekh.png)

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

Enfin, le dossier "images" contient les différentes images que nous avons utilisées sur le site.


## Première interprétations

Tout d'abord, nous pouvons remarquer que toutes les régions ont des tendances similaires. En considérant par exemple le nombre d'entrées, nous pouvons observer pour toutes les régions une diminution du nombre d'entrées dans les années 80 avant une augmentation dans les années 90, cette dernière étant due à l'apparition des multiplexes dans les cinémas des villes moins importantes. De temps en temps, nous pouvons remarquer quelques divergences, comme le nombre d'entrées pour la Corse qui fait un pic en 1980 (sûrement à cause de la sortie d'un film corse au cinéma cette année-là), mais ces dernières sont rares.

L'impact de la Covid-19 est bien sûr visible pour l'année 2020, avec une chute drastique pour la plupart des indicateurs (nombre d'entrées, nombre de séances, recettes...).

Nous pouvons également identifier l'augmentation du prix des places de cinémas et du nombre de cinémas. En effet, même si nous remarquons depuis les années 2000 un nombre d'entrées plutôt stable (exception faite de l'année 2020), les recettes ne cessent d'augmenter, ce qui prouve que le prix d'une entrée a augmenté.

Enfin, une dernière observation intéressante concerne les établissements présents dans chaque région. Il y a très souvent un nombre important de cinémas réalisant peu d'entrées, et peu de gros cinémas réalisant beaucoup d'entrées. Néanmoins, la région Île-de-France est une exception : elle contient un nombre de grands établissements non néagligeables.
