$(document).ready(function() {


	var width = parseInt(d3.select('#map').style('width')),
	mapRatio = .7,
	height = width * mapRatio;

	var transitionTime = 700;
//	var color = d3.scale.category20c();
	var color = d3.scale.category20c();

	
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
		var tooltip = d3.select('body')
			.append('div')
			.attr('class','tooltip');
			var _chart = dc.marginMixin(dc.colorMixin(dc.baseMixin({})));
			//Makes into tree structure
			function makeTree (json) {
				json = {"name":"tree","children":json}
				return json;
			}

			//Filters unwanted and slices to top 10
			function removeUnwanted (json, removeList) {
			
				json = json.filter( function(d) {
					return removeList.indexOf(d.key) <= 0 && +d.value > 2;
				});
				return json;
			};
			

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
				function tipmouseover() {
  					tooltip.style("display", "inline").style("opacity",100);
				}

				function tipmousemove(d) {
  					tooltip
						.text(d.key + ": " + d.value)
      					.style("left", (d3.event.pageX - 34) + "px")
      					.style("top", (d3.event.pageY - 12) + "px");
					}

				function tipmouseout() {
					tooltip.style("display", "none");
				}

				var parentID =  d3.select(this.anchor()).node().parentNode.id 
				parentID = "#"+ parentID
				parentWidth = d3.select(parentID).node().getBoundingClientRect().width
				group = _chart.dimension().group().reduceCount().all(); 
				_chart.selectAll("div").remove();
				var treemap = d3.layout.treemap()
				.size([parentWidth,_chart.height()])
					.sticky(false)
					.value(function(d) { return d.value;});
				var node = _chart.root()
					.datum(makeTree(removeUnwanted(group, _removeThese)))
					.selectAll(".node")
					.data(treemap.nodes)
					.enter().append("div")
					.attr("class","node")
					.call(position)
					.style("background-color", function(d) {
						return d.name=='tree' ?'#fff': color( d.key );
					})
					.append('div')
					.html(function(d) { return d.key + "<br />" + d.value; })
					.on("mouseover", tipmouseover)
					.on("mousemove", tipmousemove)
					.on("mouseout",tipmouseout)
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
//Visualize it
			Map
				.dimension(oblaskDim)
				.group(oblaskDim.group().reduceCount(function(d) { return d.value;}))
				.center([49,33])
				.height(400)
				.zoom(5)
				.geojson(ukraineData)
				.colors(colorbrewer.YlGnBu[7])
				.colorAccessor(function(d,i) {
					return d.value;
				})
				.featureKeyAccessor(function(feature) {
					return feature.properties.NAMELATIN;
				});

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
		
		internetTreeChart
			.chartGroup("main")
//			.width(d3.select("#internet").node().getBoundingClientRect()["width"])
			.dimension(intDim)
			.removeThese(["undefined","Difficult to answer","NA"]);

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



		dc.renderAll("main");

		//register charts
		dc.registerChart(internetTreeChart, "main");
		dc.registerChart(langPortion, "main");
		dc.registerChart(educPortion, "main");

		//redraw all Charts
		dc.redrawAll();
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
