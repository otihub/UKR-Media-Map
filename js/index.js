$(document).ready(function() {


	var width = parseInt(d3.select('#map').style('width')),
	mapRatio = .7,
	height = width * mapRatio;

	var transitionTime = 700;
	var color = d3.scale.category20c();


	d3.json("data/chosen.factor.json", function(error, json) {


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
		var intUseDim = cf.dimension(function(d) {return d.v5;})
		var radioDim = cf.dimension(function(d) {return d.v41;})
		var radioUseDim = cf.dimension(function(d) {return d.v33;})
		var tvDim = cf.dimension(function(d) {return d.v57;})
		var tvUseDim = cf.dimension(function(d) {return d.v46;})
		var printDim = cf.dimension(function(d) {return d.v68;})
		var printUseDim = cf.dimension(function(d) {return d.v62;})
// Create groups
		var languageDimGroup = languageDim.group().reduceCount()
		var ageDimGroup = ageDim.group().reduceCount()
		var educDimGroup = educDim.group().reduceCount()
		var wealthDimGroup = wealthDim.group().reduceCount()
//	console.log(cf.all())	
// formatter for percent
		var percent = d3.format(".0%");


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

//add values in a group array
		var percExt = function (group, key) {
			var total = 0;
			var numerator = 0;
			array = group.all()
			
		
			for (var i=0; i < array.length ; i++) {
				 	total += array[i].value;
					if (Array.isArray(key)) {
						if (key.indexOf(array[i].key) > -1){
							numerator += array[i].value;
							}
						}

					else {

						if (array[i].key == key) {
							numerator = array[i].value;
						}
					}
			}
			return numerator/total;
		}
		

//Make DC.js charts
		var genderPieChart = dc.pieChart("#gender-pie-graph","main");
		var ageRowChart = dc.rowChart("#age-horiz-graph","main");
		var internetTreeChart = dc.treeChart("#net-tree-graph", "main");
		var Map = dc_leaflet.choroplethChart("#map","main");
		var radioChart = dc.rowChart("#radioBarChart","main")
		var tvChart = dc.rowChart("#tvBarChart","main")
		var internetChart = dc.rowChart("#internetBarChart","main")
		var printChart = dc.rowChart("#printBarChart","main")
		var russianNum = dc.numberDisplay("#russianPerc","main")
			.group(languageDimGroup)
			.formatNumber(percent)
			.valueAccessor(function (d) {
				return percExt(languageDimGroup,"Russian")
			});
		var ukrainianNum = dc.numberDisplay("#ukrainianPerc","main")
			.group(languageDimGroup)
			.formatNumber(percent)
			.valueAccessor(function (d) {
				return percExt(languageDimGroup,"Ukrainian")
			});
		var youngAgeNum = dc.numberDisplay("#youngAgePerc","main")
			.group(ageDimGroup)
			.formatNumber(percent)
			.valueAccessor(function (d) {
				return percExt(ageDimGroup,"18-35")
			});
		var mediumAgeNum = dc.numberDisplay("#mediumAgePerc","main")
			.group(ageDimGroup)
			.formatNumber(percent)
			.valueAccessor(function (d) {
				return percExt(ageDimGroup,"36-55")
			});
		var oldAgeNum = dc.numberDisplay("#oldAgePerc","main")
			.group(ageDimGroup)
			.formatNumber(percent)
			.valueAccessor(function (d) {
				return percExt(ageDimGroup,"56+")
			});
		var primaryEducNum = dc.numberDisplay("#primaryEducPerc","main")
			.group(educDimGroup)
			.formatNumber(percent)
			.valueAccessor(function (d) {
				return percExt(educDimGroup,"Primary school (finished the primary school, a 4-9 year pupi");
			});
		var secondaryEducNum = dc.numberDisplay("#secondaryEducPerc","main")
			.group(educDimGroup)
			.formatNumber(percent)
			.valueAccessor(function (d) {
				return percExt(educDimGroup,["Secondary school (finished 9 years, a 10-11 year pupil)","Complete secondary school (finished 10-11 years)"]);
			});
		var uniEducNum = dc.numberDisplay("#uniEducPerc","main")
			.group(educDimGroup)
			.formatNumber(percent)
			.valueAccessor(function (d) {
				return percExt(educDimGroup,["Higher educational institution (Specialist or Master degree)"]);
			});	

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
				})
				.on("postRedraw",function(d) {
					var titleHTML = "";
					var subtitleHTML = ""
					var selected = d.filters();
					if (selected.length == 1 ) {
						titleHTML =  selected[0];
					}
					else if (selected.length == 0) {
						titleHTML = "All Surveyed Areas";
					}
					else {

						titleHTML = "Select Surveyed Areas";
						for (i=0;i< selected.length - 1;i++) {
							subtitleHTML += selected[i] + ", " ;
							}
						subtitleHTML +=  " " + selected[selected.length-1];
						}
					d3.select("#geography").html(titleHTML);
					d3.select("#geographySub").html(subtitleHTML);
				 });

		genderPieChart
			.width(15)
			.height(15)
			.dimension(genderDim)
			.group(genderDim.group())
			.transitionDuration(transitionTime)
	//		.radius(width/60)
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

		radioChart
			.width(300)
			.height(125)
			.dimension(radioUseDim)
			.group(radioUseDim.group())
			.elasticX(false)
			.renderTitle(true)
			.title(function() { return "How often to you listen to the radio?"})
			.xAxis().ticks(4);	

		tvChart
			.width(300)
			.height(125)
			.dimension(tvUseDim)
			.group(tvUseDim.group())
			.elasticX(false)
			.renderTitle(true)
			.title(function() { return "How often to you watch television?"})
			.xAxis().ticks(4);	
		internetChart
			.width(300)
			.height(125)
			.dimension(intUseDim)
			.group(intUseDim.group())
			.elasticX(false)
			.renderTitle(true)
			.title(function() { return "How often to you use the internet?"})
			.xAxis().ticks(4);
		printChart
			.width(300)
			.height(125)
			.dimension(printUseDim)
			.group(printUseDim.group())
			.elasticX(false)
			.renderTitle(true)
			.title(function() { return "How often to you read print media?"})
			.xAxis().ticks(4);

		dc.renderAll("main");

		//register charts
		dc.registerChart(internetTreeChart, "main");

		//redraw all Charts
		dc.redrawAll();
	});


		//on window change resize the svg to fit d
		function sizeChange() {
	//	var width = parseInt(d3.select('#map').style('width')),
	//		mapRatio = .7
	//		height = width * mapRatio;
	//	d3.select("#drawer").style("height",height + "px");
		}
		//update Charts
		function updateChart() {

		}
	});
})
