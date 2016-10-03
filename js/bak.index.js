$(document).ready(function() {
	
	var geometry_center =  {"latitude": 48.360833, "longitude": 31.1809725};
	var geography_center = {"latitude": 49.0275, "longitude": 31.482778};

	var width = parseInt(d3.select('#map').style('width')),
	mapRatio = .7,
	height = width * mapRatio;		

	var transitionTime = 700;
	var color = d3.scale.category20();
	d3.json("data/surveyResponse.json", function(error, json) {

		if(error) return
		surveyData = json;
		console.warn(error);
//Make DC.js charts
		var genderPieChart = dc.pieChart("#gender-pie-graph"); 		
		var ageRowChart = dc.rowChart("#age-horiz-graph"); 
//		var wealthHorizChart = dc.barChart("#wealth-horiz-graph");
		 
				
//Create CrossFilter
		var cf = crossfilter(surveyData);

//Create Dimensions
		var genderDim = cf.dimension(function(d) {return d.v2;})
		var ageDim = cf.dimension(function(d) {return d.v172;})
		var educDim = cf.dimension(function(d) {return d.v152;})
		var employDim = cf.dimension(function(d) {return d.v153;})
		var wealthDim = cf.dimension(function(d) {return d.v154;})
		var languageDim = cf.dimension(function(d) {return d.v155;})
		var oblaskDim = cf.dimension(function(d) {return d.v175;})
		var tvDim = cf.dimension(function(d) {return d.v57;})
		var intDim = cf.dimension(function(d) {return d.v27;})
//Create Groups
		var tvGroup = tvDim.group()
//		var intGroup = intDim.group()
		console.log("real butts")	
		
	
//Visualize it
		genderPieChart
			.width(width/30)
			.height(width/30)
			.dimension(genderDim)
			.group(genderDim.group())
			.transitionDuration(transitionTime)
			.radius(width/60)
			.renderLabel(false);
					
		ageRowChart
			.width(width/10)
			.height(width/10)
			.dimension(ageDim)
			.margins({top:0,right:0,bottom:-1,left:0})
			.group(ageDim.group())
			.renderLabel(true)
			.xAxis().tickValues([]);
	

		dc.renderAll();
//portion text chart for summarizing the factors in a dataset and printing them as a their individual proportions
		dc.portionTextChart = function (parent, dim, chartGroup) {
		//	var recordsTotal = cf.groupAll().value();
			var recordsTotal = languageDim.groupAll().value();

			console.log(recordsTotal)
			var _chart = dc.marginMixin(dc.colorMixin(dc.baseMixin({})));
			function position() {
				this.style("left",function(d) { 
					return d.x + "px";
				})	
				.style("top",function(d) {return d.y + "px";})	
				.style("width",function(d) {return Math.max(0, d.dx -1) + "px";})	
				.style("height",function(d) {return Math.max(0, d.dy -1) + "px";})	
			}

		//accessor function to add a list of items to remove from the chart _ but keep in data
			_chart.removeList = function(_) {
			   if (!arguments.length) {
    		      return _;
     			 }
      			_removeList = _;
      			return _chart;
 			 };		
	
		//formatter for percent	
			percent = d3.format(".0%")

			_chart._doRender = function() {
				
			//	var items = rollup(tvDim);

			var items = tvGroup.all()
				console.log(_chart.dimension().groupAll().reduceSum())
				function itemsToRemove (element) {
					return _removeList.indexOf(element.key) == -1;
				}

				_chart.selectAll("div").remove();
				var line = _chart.root()
					.selectAll(".overview-label")
					.data(items.filter(itemsToRemove))
					.enter().append("span")
					.attr("class","overview-label")
					.text( function(d) {return d.key;})
					.append("span")
					.attr("class","overview-value")
					.text(function(d) {return  percent(d.values/recordsTotal);})
			};
			
			_chart._doRedraw = function() {
				console.log("rerender")
				return _chart._doRender();

		};
			return _chart.anchor(parent, chartGroup)
		};
			
	    dc.treeChart =  function (parent,dim,chartGroup) {
			var _chart = dc.marginMixin(dc.colorMixin(dc.baseMixin({})));
			function position() {
				this.style("left",function(d) { 
					return d.x + "px";
				})	
				.style("top",function(d) {return d.y + "px";})	
				.style("width",function(d) {return Math.max(0, d.dx -1) + "px";})	
				.style("height",function(d) {return Math.max(0, d.dy -1) + "px";})	
			}

			_chart._doRender = function() {
				_chart.selectAll("div").remove();
				var treemap = d3.layout.treemap()
					.size([_chart.width(),_chart.height()])
					.sticky(false)
					.value(function(d) { return d.values;});
				var node = _chart.root()
					.datum(rollup(dim)).selectAll(".node")
					.data(treemap.nodes)
					.enter().append("div")	
					.attr("class","node")
					.call(position)
					.style("background-color", function(d) {
						return d.name=='tree' ?'#fff': color( d.key ); 
					})
					.append('div')
					.text(function(d) { return d.key; });
				};

			_chart._doRedraw = function() {
				return _chart._doRender();

			};
			return _chart.anchor(parent, chartGroup)
		}


			function rollup(dim) {
				console.log(dim.all());
			//	console.log(dim.group(function(v2) {return v2;}))
				console.log("butts")
		//		var rows = group.groupAll().value();
		//		console.log(rows.length)
		//		console.log(rows)
			//Generate array of frequencies by user pick
		//		var favorites = d3.nest()
		//			.key(function(d) {return d[attribute];})
		//			.rollup(function(v) {return v.length;})
		//			.entries(rows);
	//			favorites.sort(function (x,y) {
	//				return d3.descending(x.values, y.values);
	//			});

			//Removes undefined and Difficult to answer 
	//			favorites = favorites.filter(function (d) {
	//				return  d.key != "undefined" && d.key != "Difficult to answer";
	//			});
	//			favorites = favorites.slice(0,10)
	//			favorites = {"name":"tree","children":favorites}
	//			return favorites;
			}

	//Makes a json into a jsontree for use in treemap
			function makeTree(json) {
				json = json.slice(0,10)
				json = {"name":"tree","children":json}
				return json;
			}
					

		//Makes Internet treeCharti
		var internetTreeChart = dc.treeChart("#net-tree-graph",intDim)
//		var langPortion = dc.portionTextChart("#lang-text-graph","v155");
		var langPortion = dc.portionTextChart("#lang-text-graph","v155");
		internetTreeChart;
		langPortion
			.removeList(["Other","Other: no answer","Other: 'surzhyk' (mixture of Ukrainian and Russian)"])
			.dimension(languageDim);
		//register chart
		dc.registerChart(internetTreeChart);
		dc.registerChart(langPortion);
		//redraw all Charts
		dc.redrawAll();

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


		// create the variable to append the svg to the map class in the html
		var svg = d3.select("body").selectAll("#map").append("svg")
		.attr("viewBox","0 0 " + width + " " + height )
		.attr("preserveAspectRatio","xMinYMin")
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
		d3.select("#drawer").style("height",height + "px");
		}
		//update Charts
		function updateChart() {
			
		}
	});
})
