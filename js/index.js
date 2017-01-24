$(document).ready(function() {

	var geometryCenter =  {"latitude": 48, "longitude": 32};
	var width = parseInt(d3.select('#map').style('width')),
	mapRatio = .7,
	height = width * mapRatio;


	var transitionTime = 700;


	var svg = d3.select('#map').append('svg')
		.attr('preserveAspectRatio','xMinYMin meet')
		.attr('viewBox', function () {
			return '0 0 ' + String(width) + ' ' + String(height)
		}) 

    var projection = d3.geo.conicEqualArea()
        .center([0, geometryCenter.latitude])
        .rotate([-geometryCenter.longitude, 0])
        .parallels([46, 52])  
        .scale(4000)
        .translate([width / 2, height / 2]);

    var path = d3.geo.path()
        .projection(projection);

	queue()
		.defer(d3.json,"data/select-oblasks.geojson")
		.defer(d3.json,"data/chosen.json")
		.defer(d3.json,"data/cities.geojson")
		.await(viz);

	function viz(error,oblasks,surveyData,cities) {	
	

				


//Filter out the json in RU controlled mostly to check to see if that was the problem
			oblasks.features = oblasks.features.filter(function(d) {
					return d.properties.NAMELATIN != "LUHANSKA OBLAST RU" && d.properties.NAMELATIN != "DONETSKA OBLAST RU";
				}
			)



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
		var leanDim = cf.dimension(function(d) {return d.v131coded;})
		var cityDim	= cf.dimension(function(d) {return d.v170;})
		var cityFilterDim	= cf.dimension(function(d) {return d.v170;})
// Create groups
		var languageDimGroup = languageDim.group().reduceCount()
		var ageDimGroup = ageDim.group().reduceCount()
		var educDimGroup = educDim.group().reduceCount()
		var wealthDimGroup = wealthDim.group().reduceCount()
		var citiesArray = cityDim.group().reduceCount().all()

//find out the average of leaning
		var leaning = leanDim.group().reduceCount().all();

//Add map
		svg.selectAll('oblasks')
			.data(oblasks.features)
			.enter()
			.append('path')
			.attr('d',path)
			.attr('class','oblasks')
			.on('click',function(d) {
				if (d3.select(this).classed('selected')) {
					oblaskDim.filterAll();
					cityFilterDim.filterAll();
					d3.selectAll('.oblasks').classed('selected',false);
					dc.redrawAll('main');
				} else {	
					d3.selectAll('.oblasks').classed('selected',false);
					d3.select(this).classed('selected',true);
					oblaskDim.filter(d.properties.NAMELATIN);
					dc.redrawAll('main');
				};	
			});

//scale for radius  of cities
		var cityScale = d3.scale.linear()
				.range([0,50])
				.domain([0,1006]);


		svg.selectAll('cities')
			.data(cities.features)
			.enter()
			.append('path')
			.attr('d',path.pointRadius(5))
			.attr('class','cities')
			.attr('id',function(d) {
				return d.properties.name.replace(/([\s\'\\])/g,'');
			})
			.style('fill','red')
			.on('click',function(d) {
				if (d3.select(this).classed('selected')) {
					cityFilterDim.filterAll()
					d3.selectAll('.cities').classed('selected',false);
					dc.redrawAll('main');
				} else {	
					d3.select(this).classed('selected',true);
					cityFilterDim.filter(d.properties.name);
					dc.redrawAll('main');
				};	
			});
		
		
// formatter for percent
		var percent = d3.format(".0%");


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
		
//Make function to filter based on selected numberDisplay and apply style to containing div after redraw

		var selectedNum = function (dimension, filter,chart) {
			var numParent =  d3.select(d3.select(chart.anchor())[0][0].parentNode)
			numParent.on("click", function() {
				if (numParent.classed("filtered")) {
					numParent.classed("filtered",false);
					numParent.selectAll("span").classed("filtered",false);
					dimension.filterAll();
					dc.redrawAll("main");
				} else {
					numParent.classed("filtered",true);
					numParent.selectAll("span").classed("filtered",true);
					dimension.filter(filter);
					dc.redrawAll("main");
				}
			})
		}

//Make DC.js charts
		var genderPieChart = dc.pieChart("#gender-pie-graph","main");
//		var ageRowChart = dc.rowChart("#age-horiz-graph","main");
		var internetTreeChart = dc.treeChart("#internetTree", "main");
		var radioTreeChart = dc.treeChart("#radioTree","main");
		var tvTreeChart = dc.treeChart("#tvTree","main");
		var printTreeChart = dc.treeChart("#printTree","main");
		var radioChart = dc.rowChart("#radioBarChart","main")
		var tvChart = dc.rowChart("#tvBarChart","main")
		var internetChart = dc.rowChart("#internetBarChart","main")
		var printChart = dc.rowChart("#printBarChart","main")

		var total = dc.numberDisplay("#total","main")
			.group(cf.groupAll())
			.valueAccessor(function(d) {
				return d;
			})
			.on("renderlet", function() {
				for (i=0; i < citiesArray.length ; i++) {
					d3.select("#" +  citiesArray[i].key.replace(/([\s\'\\])/g,''))
						.transition()
						.attr("d", path.pointRadius(cityScale(citiesArray[i].value)));
			}		
		});
	
		var russianNum = dc.numberDisplay("#russianPerc","main")
			.group(languageDimGroup)
			.formatNumber(percent)
			.valueAccessor(function (d) {
				return percExt(languageDimGroup,"Russian")
			})
			.on("renderlet",function (russianNum) {
				selectedNum(languageDim,"Russian",russianNum);
			});
		var ukrainianNum = dc.numberDisplay("#ukrainianPerc","main")
			.group(languageDimGroup)
			.formatNumber(percent)
			.valueAccessor(function (d) {
				return percExt(languageDimGroup,"Ukrainian")
			})
			.on("renderlet",function (ukrainianNum) {
				selectedNum(languageDim,"Ukrainian",ukrainianNum);
			});
		var youngAgeNum = dc.numberDisplay("#youngAgePerc","main")
			.group(ageDimGroup)
			.formatNumber(percent)
			.valueAccessor(function (d) {
				return percExt(ageDimGroup,"18-35")
			})
			.on("renderlet",function (youngAgeNum) {
				selectedNum(ageDim,"18-35",youngAgeNum);
			});

		var mediumAgeNum = dc.numberDisplay("#mediumAgePerc","main")
			.group(ageDimGroup)
			.formatNumber(percent)
			.valueAccessor(function (d) {
				return percExt(ageDimGroup,"36-55")
			}).on("renderlet",function (mediumAgeNum) {
				selectedNum(ageDim,"36-55",mediumAgeNum);
			});
		var oldAgeNum = dc.numberDisplay("#oldAgePerc","main")
			.group(ageDimGroup)
			.formatNumber(percent)
			.valueAccessor(function (d) {
				return percExt(ageDimGroup,"56+")
			}).on("renderlet",function (oldAgeNum) {
				selectedNum(ageDim,"56+",oldAgeNum);
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
		
		
		var leaningNum = dc.leaningChart("#leaning","main")
			.dimension(leanDim)
			.group(leaning)
			.height(15)
			.width(250);



//Visualize it

		genderPieChart
			.width(15)
			.height(15)
			.dimension(genderDim)
			.group(genderDim.group())
			.transitionDuration(transitionTime)
	//		.radius(width/60)
			.renderLabel(false);

//		ageRowChart
//			.width(width/10)
//			.height(200)
//			.dimension(ageDim)
//			.margins({top:0,right:0,bottom:-1,left:0})
//			.group(ageDim.group())
//			.renderLabel(true)
//			.xAxis().tickValues([]);

		internetTreeChart
			.chartGroup("main")
			.dimension(intDim)
			.removeThese(["undefined","Difficult to answer","NA"]);

		printTreeChart
			.chartGroup("main")
			.dimension(printDim)
			.removeThese(["undefined","Difficult to answer","NA"]);

		tvTreeChart
			.chartGroup("main")
			.dimension(tvDim)
			.removeThese(["undefined","Difficult to answer","NA"]);

		radioTreeChart
			.chartGroup("main")
			.dimension(radioDim)
			.removeThese(["undefined","Difficult to answer","NA"]);
		radioChart
//			.width(200)
			.height(200)
			.dimension(radioUseDim)
			.group(radioUseDim.group())
			.elasticX(true)
			.renderTitle(true)
			.title(function() { return "How often to you listen to the radio?"})
			.xAxis().ticks(4);	

		tvChart
//			.width(200)
			.height(200)
			.dimension(tvUseDim)
			.group(tvUseDim.group())
			.elasticX(true)
			.renderTitle(true)
			.title(function() { return "How often to you watch television?"})
			.xAxis().ticks(4);	
		internetChart
//			.width(200)
			.height(200)
			.dimension(intUseDim)
			.group(intUseDim.group())
			.elasticX(true)
			.renderTitle(true)
			.title(function() { return "How often to you use the internet?"})
			.xAxis().ticks(4);
		printChart
//			.width(200)
			.height(200)
			.dimension(printUseDim)
			.group(printUseDim.group())
			.elasticX(true)
			.renderTitle(true)
			.title(function() { return "How often to you read print media?"})
			.xAxis().ticks(4);

		dc.renderAll("main");

		//register charts
		dc.registerChart(internetTreeChart, "main");

		//redraw all Charts
		dc.redrawAll();

	}


});

