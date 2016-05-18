$(document).ready(function() {
		var geometry_center =  {"latitude": 48.360833, "longitude": 31.1809725};
		var geography_center = {"latitude": 49.0275, "longitude": 31.482778};

		var width = parseInt(d3.select('#map').style('width')),
			mapRatio = .7,
			height = width * mapRatio;
		
		piRadius = width/60

		var color = d3.scale.category20();
		//abstract function to create a pie chart 
		function pieChart(element, dim) {

	 	 	var data = dim.group().reduceCount().all();
			var piHight = piRadius *2, 
				piWidth = piRadius * 2;
			var svg = d3.select(element)
				.append("svg:svg")
				.attr("width",piHight)
				.attr("height",piWidth)
			.append("svg:g")
				.attr("transform","translate(" + (piHight / 2) + "," + (piWidth / 2) + ")");

			var arc = d3.svg.arc()
				.outerRadius(piRadius);

			var pie = d3.layout.pie()
				.value(function(d) { return d.value;})
				.sort(null)

			var path = svg.selectAll("path")
				.data(pie(data))
				.enter()
				.append("path")
				.attr("d",arc)
				.attr("fill", function(d) {
					return color(d.data.value) 
				});

		
		}

	//abstract function to create vertical divchart
		function vertChart(element, dim) {
			var width = d3.select(element).style("width");
			var barHeight = 20;
			var data =  dim.group().reduceCount().all();
			var x = d3.scale.linear()
				.domain([0,d3.max(data, function (x) {
						return x.value;
					}
				)])
				.range([0,width]);
			var chart = d3.select(element)
				.attr("width",width)
				.attr("height", barHeight * data.length);
			var bar = chart.selectAll("g")
					.data(data)
			 	.enter().append("g")
					.attr("transform",function(d,i) { return "translate(0," + i * barHeight + ")";});
			bar.append("rect")
				.attr("width",function(d) {
					return x(d.value);
				})
				.attr("height",barHeight - 1);
			bar.append("text")
				.attr("x",3)
				.attr("y",barHeight/2)
				.attr("dy",".35em")
				.text(function(d) {return d.key;});
					
		}
		
	//astract function to make treemap

		function treeChart(media, records, element) {
			//Set grab width and height of containing div [element]		
			var width = innerWidth - 40;
			var height = innerHeight - 40;
			//Generate array of frequencies by user pick
			var favorites = d3.nest()
				.key(function(d) {return d[media];})
				.rollup(function(v) {return v.length;})
				.entries(records);
			favorites.sort(function (x,y) {
				return d3.descending(x.values, y.values);
			});
			
			//Save frequency array in format treemap likes
			favorites = {"name":"tree","children":favorites}

			var div = d3.select(element).append("div").style("position","relative")
			var treemap = d3.layout.treemap()
				.size([width,height])
				.sticky(true)
				.value(function(d) {return d.values;});
			var node = div.datum(favorites).selectAll(".node")
					.data(treemap.nodes)
				.enter().append("div")	
					.attr("class","node")
					.call(position)
					.style("background-color", function(d) {
						return d.name=='tree' ?'#fff': color( d.key ); 
					})
					.append('div')
					.text(function(d) { return d.key; });
			function position() {
				this.style("left",function(d) { 
						return d.x + "px";
					})	
					.style("top",function(d) {return d.y + "px";})	
					.style("width",function(d) {return Math.max(0, d.dx -1) + "px";})	
					.style("height",function(d) {return Math.max(0, d.dy -1) + "px";})	
			}

			}
		

		d3.select("#drawer").style("height",height + "px");
		var projection = d3.geo.conicEqualArea()
			.center([0, geometry_center.latitude])
			.rotate([-geometry_center.longitude, 0])
			.parallels([46, 52]);  // vsapsai: selected these parallels myself, most likely they are wrong.
		var path = d3.geo.path()
			.projection(projection);
		d3.select(window).on("resize",sizeChange);
		// bring in survey data; will be available within the call
		var surveyData;
		projection
			.scale(width * 4.5)
			.translate([width / 2, height / 2]);

		d3.json("data/surveyResponse.json", function(error, json) {
			if(error) return console.warn(error);
			surveyData = json;
			visualizeit(surveyData);

		});
		function visualizeit(surveyData) {
		// Bring the Survey Data into crossfilter
			var cf = crossfilter(surveyData);
			var genderDim = cf.dimension(function(d) {return d.v2;})
			var ageDim = cf.dimension(function(d) {return d.v172;})
			var educDim = cf.dimension(function(d) {return d.v152;})
			var employDim = cf.dimension(function(d) {return d.v153;})
			var wealthDim = cf.dimension(function(d) {return d.v154;})
			var languageDim = cf.dimension(function(d) {return d.v155;})
			var oblaskDim = cf.dimension(function(d) {return d.v175;})
			console.log(cf.all())
//			var cityDim = cf.dimension(function(d) {return d.v170;})
	
//			var onlineFavDim = cf.dimension(function(d) {return d.v27;})
//			var radioFavDim = cf.dimension(function(d) {return d.v41;})
//			var tvFavDim = cf.dimension(function(d) {return d.v57;})
//			var newsFavDim = cf.dimension(function(d) {return d.v68;})
			
	//Makes Internet treeChart
			treeChart("v27",cf.all(), "#net-tree-graph")
			

	//Makes Gender piechart			 

			pieChart("#gender-pie-graph", genderDim);
			
	//Makes wealth graph
			vertChart("#wealth-vert-graph",wealthDim);

	//Makes age graph
			vertChart("#age-vert-graph", ageDim);
	
		}



		// create the variable to append the svg to the map class in the html
		var svg = d3.select("body").selectAll("#map").append("left").append("svg")
			.attr("width", width)
			.attr("height", height)
				.append("g");




		var topo_data = null;

		d3.json("data/ukraine.json", function(error, ukraineData) {
			topo_data = ukraineData;

			var countries = topojson.feature(ukraineData, ukraineData.objects.countries);
			svg.selectAll(".country")
				.data(countries.features)
				.enter().append("path")
				.attr("class", function(d) { return "country " + d.id; })
					.attr("d", path);

			svg.append("path")
				.datum(topojson.mesh(ukraineData, ukraineData.objects.countries, function(a, b) { return a !== b; }))
				.attr("class", "country-boundary")
				.attr("d", path);
			svg.append("path")
				.datum(topojson.mesh(ukraineData, ukraineData.objects.countries, function(a, b) { return a === b; }))
				.attr("class", "coastline")
				.attr("d", path);

			var water_group = svg.append("g")
				.attr("id", "water-resources");
			var rivers = topojson.feature(ukraineData, ukraineData.objects.rivers);
			water_group.selectAll(".river")
				.data(rivers.features)	
				.enter().append("path")
				.attr("class", "river")
				.attr("name", function(d) { return d.properties.name; })
				.attr("d", path);

				// Add lakes after rivers so that river lines connect reservoirs, not cross them.
			var lakes = topojson.feature(ukraineData, ukraineData.objects.lakes);
			water_group.selectAll(".lake")
				.data(lakes.features)
				.enter().append("path")
				.attr("class", "lake")  // Note: not necessary a lake, it can be a reservoir.
				.attr("name", function(d) { return d.properties.name; })
				.attr("d", path);

			var regions = topojson.feature(ukraineData, ukraineData.objects.regions);
				svg.selectAll(".region")
				.data(regions.features)
				.enter().append("path")
				.classed("region", true)
				.attr("id", function(d) { return d.id; })
				.attr("d", path);
			svg.append("path")
				.datum(topojson.mesh(ukraineData, ukraineData.objects.regions, function(a, b) { return a !== b; }))
				.classed("region-boundary", true)
				.attr("d", path);

		});


//on window change resize the svg to fit d
		function sizeChange() {
			var width = parseInt(d3.select('#map').style('width')),
				mapRatio = .7
				height = width * mapRatio;
		//update projection
			projection
				.scale([width * 4.5])
				.translate([width / 2, height / 2]);
		//resize #mapc container and and svg
			
			d3.select("svg").attr("width",width).attr("height",height);
			d3.select("#map").style("height",height + "px");
		
		//reset d attribute to new datum
			d3.selectAll("path").attr('d',path);

			d3.select("#drawer").style("height",height + "px");

			
		}
})
