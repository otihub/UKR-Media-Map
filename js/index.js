$(document).ready(function() {

	var geometry_center =  {"latitude": 48.360833, "longitude": 31.1809725};
	var geography_center = {"latitude": 49.0275, "longitude": 31.482778};

	var width = parseInt(d3.select('#map').style('width')),
	mapRatio = .7,
	height = width * mapRatio;

	var transitionTime = 700;
	var color = d3.scale.category20();
	d3.json("data/chosen.json", function(error, json) {
		

		if(error) return
		surveyData = json;
		console.warn(error);


		

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
		var intDim = cf.dimension(function(d) {return d.v27;})
		var radioDim = cf.dimension(function(d) {return d.v41;})
		var tvDim = cf.dimension(function(d) {return d.v57;})

			
		//portion text chart for summarizing the factors in a dataset and printing them as a their individual proportions
		dc.portionTextChart = function (parent, chartGroup) {
			var _chosen;
			var _title;
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
			_chart._chosen = function(_) {
			   if (!arguments) {
    		      return _chosen;
     			 }
      			_chosen = _;
      			return _chart;
 			 };

		//accessor function to grab a title for the graph			

			_chart._title = function(_) {
			   if (!arguments) {
				  console.log(_chosen);
    		      return _chosen;
     			 }
      			_title = _;
      			return _chart;
 			 };


		//formatter for percent
			percent = d3.format(".0%")

			_chart._doRender = function() {

				var recordsTotal = _chart.dimension().groupAll().reduceCount().value();
				var items = _chart.dimension().group().reduceCount().all()

				function itemsToRemove (x) {
					return _chosen.indexOf(x.key) != -1;
					
				}
				_chart.selectAll("span").remove();
				var line = _chart.root()
				line.selectAll("span").remove();
				line.selectAll(".overview-label")
					.data(items.filter(itemsToRemove))
					.enter().append("span")
					.attr("class","overview-label")
					.text( function(d) { return _title;})
					.append("span")
					.attr("class","overview-value")
					.text(function(d) {return  percent(d.value/recordsTotal);})
			};

			_chart._doRedraw = function() {

				return _chart._doRender();

		};
			return _chart.anchor(parent, chartGroup)
		};
	    dc.treeChart =  function (parent, chartGroup) {
			console.log(chartGroup);	
			//Makes into tree structure
			function makeTree (json) {
				json = {"name":"tree","children":json}
				return json;
			}
			//Filters unwanted and slices to top 10
			function removeUnwanted (json, removeList) {
			
				json = json.filter( function(d) {
					return removeList.indexOf(d.key) <= 0;
				});
				json = json.slice(0,10)
				return json;
			};
			
			var _chart = dc.marginMixin(dc.colorMixin(dc.baseMixin({})));

			_chart.removeThese = function(_) {
			   	if (!arguments.length) {
    		   		return _;
     			 }
      			_removeThese = _;
      				return _chart;
 			 	};

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
					.value(function(d) { return d.value;});

				var node = _chart.root()
					.datum(makeTree(removeUnwanted(_chart.dimension().group().reduceCount().all() , _removeThese)))
					.selectAll(".node")
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
//Make DC.js charts
		var genderPieChart = dc.pieChart("#gender-pie-graph","main");
		var ageRowChart = dc.rowChart("#age-horiz-graph","main");		
		var internetTreeChart = dc.treeChart("#net-tree-graph", "main");
		var langPortion = dc.portionTextChart("#lang-text-graph", "main");
		var educPortion = dc.portionTextChart("#educ-text-graph", "main");
		var Map = dc_leaflet.choroplethChart("#map","main");

		

		d3.json("data/select-oblasks.geojson", function(error, ukraineData) {

//Filter out the json in RU controlled mostly to check to see if that was the problem 
			ukraineData.features = ukraineData.features.filter(function(d) {
					return d.properties.NAMELATIN != "LUHANSKA OBLAST RU" && d.properties.NAMELATIN != "DONETSKA OBLAST RU";
				}
			)
console.log(oblaskDim.group().reduceCount(function(d) { return d.value;}).all())
//Visualize it
			Map
				.dimension(oblaskDim)
				.group(oblaskDim.group().reduceCount(function(d) { return d.value;}))
				.center([49,33])
				.width(600)
				.height(400)
				.zoom(5)
				.geojson(ukraineData)
				.colors(colorbrewer.YlGnBu[7])
				.colorAccessor(function(d,i) {
					return d.value;
				})
				.featureKeyAccessor(function(feature) {
					console.log(feature.properties.NAMELATIN);
					return feature.properties.NAMELATIN;
				});

	console.log(Map);	
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
		
		var groupLang = languageDim.group()
	
		internetTreeChart
			.chartGroup("main")
			.dimension(intDim)
			.removeThese(["undefined","Difficult to answer"]);

		educPortion
			.chartGroup("main")
			.dimension(educDim)
			._title("Primary")
			._chosen("Primary school (finished the primary school, a 4-9 year pupi");


		langPortion
			.chartGroup("main")
			.dimension(languageDim)
			._chosen("Russian")
			._title("Russian");




		//register charts
		dc.registerChart(internetTreeChart, "main");
		dc.registerChart(langPortion, "main");
		dc.registerChart(educPortion, "main");

		dc.renderAll("main");
		//redraw all Charts
//		dc.redrawAll();
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
