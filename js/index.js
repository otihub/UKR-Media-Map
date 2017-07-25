$(document).ready(function() {
	//start google analytice engine
	(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
	(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
	m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
	})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

	ga('create', 'UA-97746128-1', 'auto');
		ga('send', 'pageview');



	var geometryCenter =  {"latitude": 49.1, "longitude": 31.75};
	var width = parseInt(d3.select('#map').style('width')),
	mapRatio = .7,
	height = width * mapRatio;


	var transitionTime = 700;


	var svg = d3.select('#map').append('svg').attr("id","ukraine")
		.attr('preserveAspectRatio','xMinYMin meet')
		.attr('viewBox', function () {
			return '0 0 ' + String(width) + ' ' + String(height)
		})

    var projection = d3.geo.mercator()
        .center([geometryCenter.longitude, geometryCenter.latitude])
       // .parallels([43, 62])
        .scale(1870)
       .translate([width / 2, height / 2]);

    var path = d3.geo.path()
        .projection(projection);

	queue()
		.defer(d3.json,"data/oblasts.geojson")
		.defer(d3.json,"data/data.m.json2")
		.defer(d3.json,"data/cities.geojson")
		.defer(d3.json,"data/int_lang.json")
		.await(viz);



	function viz(error,oblasts,surveyData,cities,intLang) {
oblasts.features.forEach( function(d) {
})

//Filter out the json in RU controlled mostly to check to see if that was the problem

			oblasts.features = oblasts.features.filter(function(d) {
					return d.properties.name == "Dnipropetrovs'ka" || d.properties.name == "Donets'ka" || d.properties.name == "Zaporiz'ka" || d.properties.name == "Odes'ka" || d.properties.name == "Kharkivs'ka" || d.properties.name == "Luhans'ka" || d.properties.name == "NGCA" || d.properties.name =="Khersons'ka" ;
				}
			)

//Create CrossFilter
		var cf = crossfilter(surveyData);



//Create Dimensions
		var genderDim = cf.dimension(function(d) {return d.v2;})
		var ageDim = cf.dimension(function(d) {return d.age;})
		var educDim = cf.dimension(function(d) {return d.edu;})
		var wealthDim = cf.dimension(function(d) {return d.wealth;})
		var languageDim = cf.dimension(function(d) {return d.v155;})
		var oblaskDim = cf.dimension(function(d) {return d.regions;})
		var intDim = cf.dimension(function(d) {return d.v27;})
		var intUseDim = cf.dimension(function(d) {return d.v5;})
		var radioDim = cf.dimension(function(d) {return d.v41;})
		var radioUseDim = cf.dimension(function(d) {return d.v33;})
		var tvDim = cf.dimension(function(d) {return d.v57;})
		var tvUseDim = cf.dimension(function(d) {return d.v46;})
		var printDim = cf.dimension(function(d) {return d.v68;})
		var printUseDim = cf.dimension(function(d) {return d.v62;})
		var leanDim = cf.dimension(function(d) {return d.v131;})
		var cityDim	= cf.dimension(function(d) {return d.cities;})
		var cityFilterDim	= cf.dimension(function(d) {return d.cities;})
		var waveDim = cf.dimension(function(d) {return d.wave;})
// Create groups
		var languageDimGroup = languageDim.group().reduceCount();
		var ageDimGroup = ageDim.group().reduceCount();
		var educDimGroup = educDim.group().reduceCount();
		var wealthDimGroup = wealthDim.group().reduceCount();
		var leanDimGroup = leanDim.group().reduceCount();
	
		var citiesArray = cityDim.group().reduceCount().all();
//reset all filters
 	d3.select("#reset-all-filters")
		.on("click", function(){
			oblaskDim.filterAll();
			cityFilterDim.filterAll();
			d3.selectAll('.oblasks').classed('selected',false);
			d3.selectAll('.cities').classed('selected',false);
			dc.filterAll("main");
			dc.redrawAll("main");
		});

		var changeGeography = function (name) {
			d3.select("#geography").html(name);
		}

//Add map

		svg.selectAll('oblasks')
			.data(oblasts.features)
			.enter()
			.append('path')
			.attr('d',path)
			.attr('class','oblasks notSelected')
			.on('click',function(d) {
				ga('send','event','oblast','click',d.properties.name_oti,1);
				if (d3.select(this).classed('selected')) {
					oblaskDim.filterAll();
					cityFilterDim.filterAll();
					d3.selectAll('.oblasks').classed('selected',false);
					changeGeography("All Surveyed Areas")
					dc.redrawAll('main');
				} else {
					d3.selectAll('.oblasks').classed('selected',false);
					d3.selectAll('.cities').classed('selected',false);
					d3.select(this).classed('selected',true);
					oblaskDim.filter(d.properties.name_oti.replace(/([\s\'\\])/g,''));
					changeGeography(d.properties.name_oti);
					dc.redrawAll('main');
				};
			});

//scale for radius  of cities
		var cityScale = d3.scale.linear()
			.range([1,25])
				.domain([0,1006]);

//d3 tip for hoverover of cities
	  var tip = d3.tip()
		.attr('class','d3-tip')
		.html(function(d) {
			var count;
			for(x in citiesArray) {
				if (d.properties.name == citiesArray[x].key) {
					count = citiesArray[x].value;
				}
			}

			return "<strong><span class='highlight'>" + d.properties.name + "</span></strong><span class='count'>" + " " + count+"</span>";

		})
		svg.call(tip);

		svg.selectAll('cities')
			.data(cities.features)
			.enter()
			.append('path')
			.attr('d',path.pointRadius(5))
			.attr('class','cities')
			.attr('id',function(d) {
				return d.properties.name.replace(/([\s\'\\])/g,'');
			})
			.attr('title','Town Name')
			.on('click',function(d) {
				ga('send','event','city','click',d.properties.name,1);
				if (d3.select(this).classed('selected')) {
					cityFilterDim.filterAll()
					d3.selectAll('.cities').classed('selected',false);
					d3.selectAll('.oblasks').classed('selected',false);
					changeGeography("Surveyed Areas");
					dc.redrawAll('main');
				} else {
					d3.select(this).classed('selected',true);
					d3.selectAll('.oblasks').classed('selected',false);
					cityFilterDim.filter(d.properties.name);
					changeGeography(d.properties.name);
					dc.redrawAll('main');
				};
			})
			.on('mouseover', tip.show)
			.on('mouseout',tip.hide);

		


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
			var numParent = d3.select(chart.anchor())
	//		var numParent =  d3.select(d3.select(chart.anchor())[0][0].parentNode)
			numParent.on("click", function() {
				if (numParent.classed("filtered")) {
					numParent.classed("filtered",false);
					numParent.selectAll("span").classed("filtered",false);
					dimension.filterAll();
					dc.redrawAll("main");
				} else {
					d3.selectAll(".overview-value").classed("filtered",false);
					numParent.classed("filtered",true);
					numParent.selectAll("span").classed("filtered",true);
					dimension.filter(filter);
					dc.redrawAll("main");
				}
			})
		}

//Make DC.js charts
		var genderPieChart = dc.pieChart("#gender-pie-graph","main");
		var internetTreeChart = dc.treeChart("#internetTree", "main");
		var radioTreeChart = dc.treeChart("#radioTree","main");
		var tvTreeChart = dc.treeChart("#tvTree","main");
		var printTreeChart = dc.treeChart("#printTree","main");
		var radioChart = dc.rowChart("#radioBarChart","main");
		var tvChart = dc.rowChart("#tvBarChart","main");
		var internetChart = dc.rowChart("#internetBarChart","main");
		var printChart = dc.rowChart("#printBarChart","main");
		var leaningBarChart = dc.rowChart("#leanBarChart","main");
		var total = dc.numberDisplay("#selected","main")
			.group(cf.groupAll())
			.valueAccessor(function(d) {
				return d;
			})
			.on("renderlet", function() {
				for (i=0; i < citiesArray.length ; i++) {

					d3.select("#" +  citiesArray[i].key.replace(/([\s\'\\/])/g,''))
						.transition()
						.attr("d", path.pointRadius(cityScale(citiesArray[i].value)));

				}
			});

		var russianNum = dc.numberDisplay("#russianPerc","main")
			.group(languageDimGroup)
			.formatNumber(percent)
			.valueAccessor(function (d) {
				return percExt(languageDimGroup,"russian")
			})
			.on("renderlet",function (russianNum) {
				selectedNum(languageDim,"Russian",russianNum);
			});

		var ukrainianNum = dc.numberDisplay("#ukrainianPerc","main")
			.group(languageDimGroup)
			.formatNumber(percent)
			.valueAccessor(function (d) {
				return percExt(languageDimGroup,"ukrainian")
			})
			.on("renderlet",function (ukrainianNum) {
				selectedNum(languageDim,"Ukrainian",ukrainianNum);
			});
		var adolescentAgeNum = dc.numberDisplay("#adolescentAgePerc","main")
			.group(ageDimGroup)
			.formatNumber(percent)
			.valueAccessor(function (d) {
				return percExt(ageDimGroup,"18-24")
			})
			.on("renderlet",function (youngAgeNum) {
				selectedNum(ageDim,"18-24",youngAgeNum);
			});
		var youngAgeNum = dc.numberDisplay("#youngAgePerc","main")
			.group(ageDimGroup)
			.formatNumber(percent)
			.valueAccessor(function (d) {
				return percExt(ageDimGroup,"25-34")
			})
			.on("renderlet",function (youngAgeNum) {
				selectedNum(ageDim,"25-34",youngAgeNum);
			});

		var mediumAgeNum = dc.numberDisplay("#mediumAgePerc","main")
			.group(ageDimGroup)
			.formatNumber(percent)
			.valueAccessor(function (d) {
				return percExt(ageDimGroup,"35-44")
			}).on("renderlet",function (mediumAgeNum) {
				selectedNum(ageDim,"35-44",mediumAgeNum);
			});
		var oldAgeNum = dc.numberDisplay("#oldAgePerc","main")
			.group(ageDimGroup)
			.formatNumber(percent)
			.valueAccessor(function (d) {
				return percExt(ageDimGroup,"45-54")
			}).on("renderlet",function (oldAgeNum) {
				selectedNum(ageDim,"45-54",oldAgeNum);
			});
		var veryoldAgeNum = dc.numberDisplay("#veryoldAgePerc","main")
			.group(ageDimGroup)
			.formatNumber(percent)
			.valueAccessor(function (d) {
				return percExt(ageDimGroup,"55-64")
			}).on("renderlet",function (oldAgeNum) {
				selectedNum(ageDim,"55-64",oldAgeNum);
			});
		var veryveryoldAgeNum = dc.numberDisplay("#veryveryoldAgePerc","main")
			.group(ageDimGroup)
			.formatNumber(percent)
			.valueAccessor(function (d) {
				return percExt(ageDimGroup,"65+")
			}).on("renderlet",function (oldAgeNum) {
				selectedNum(ageDim,"65+",oldAgeNum);
			});
		var primaryEducNum = dc.numberDisplay("#primaryEducPerc","main")
			.group(educDimGroup)
			.formatNumber(percent)
			.valueAccessor(function (d) {
				return percExt(educDimGroup,"Primary School");
			});
		var secondaryEducNum = dc.numberDisplay("#secondaryEducPerc","main")
			.group(educDimGroup)
			.formatNumber(percent)
			.valueAccessor(function (d) {
				return percExt(educDimGroup,"At Least Some Secondary School");
			});


		var postSecondaryEducNum = dc.numberDisplay("#postSecondaryEducPerc","main")
			.group(educDimGroup)
			.formatNumber(percent)
			.valueAccessor(function (d) {
				return percExt(educDimGroup,["Post Secondary"]);
			});

//function to attache onlick events to buttons for filter on wave
	d3.select("#wave1").on("click",function(d) {
console.log(d3.select(this).classed("clicked"))	
		if(d3.select(this).classed("clicked")){
   			waveDim.filter(null);
			d3.selectAll(".btn-info").attr("class","btn-info btn-sm");
	//		dc.filterAll("main");
			dc.redrawAll("main");
		} else {
			d3.selectAll(".btn-info").attr("class","btn-info btn-sm");
			d3.select(this).attr("class","btn-info btn-sm clicked");
			waveDim.filter(null);
			waveDim.filter("1");
	//		dc.filterAll("main");
			dc.redrawAll("main");
		}
	});

//function to attache onlick events to buttons for filter on wave
	d3.select("#wave2").on("click",function(d) {
			if(d3.select(this).classed("clicked")){
					waveDim.filter(null);
					d3.selectAll(".btn-info").attr("class","btn-info btn-sm");
			//		dc.filterAll("main");
					dc.redrawAll("main");
				} else {
					console.log("flipp")
					d3.selectAll(".btn-info").attr("class","btn-info btn-sm");
					d3.select(this).attr("class","btn-info btn-sm clicked");
					waveDim.filter(null);
					waveDim.filter("2");
			//		dc.filterAll("main");
					dc.redrawAll("main");
				}
	});


//Visualize it

//Main color
		var mainColor = '#3182bd';

//Charts
		genderPieChart
			.width(70)
			.height(70)
			.dimension(genderDim)
			.group(genderDim.group())
			.transitionDuration(transitionTime)
			.renderLabel(true);


		internetTreeChart
			.chartGroup("main")
			.dimension(intDim)
			.groupList(intLang)
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
			.colors(d3.scale.ordinal().domain(["only"]).range([mainColor]))
			.dimension(radioUseDim)
			.group(radioUseDim.group())
			.valueAccessor(function(d) {
				return d.value/radioUseDim.top(Infinity).length;
				})
			.elasticX(true)
			.renderTitle(true)
			.title(function() { return "How often to you listen to the radio?"})
			.xAxis().ticks(4).tickFormat(function(v) { return String(v * 100) + '%'}) ;






		tvChart
//			.width(200)
			.height(200)
			.colors(d3.scale.ordinal().domain(["only"]).range([mainColor]))
			.dimension(tvUseDim)
			.group(tvUseDim.group())
			.valueAccessor(function(d) {
				return d.value/tvUseDim.top(Infinity).length;
				})
			.elasticX(true)
			.renderTitle(true)
			.title(function() { return "How often to you watch television?"})
			.xAxis().ticks(4).tickFormat(function(v) { return String(v * 100) + '%'}) ;
		internetChart
//			.width(200)
			.height(200)
			.colors(d3.scale.ordinal().domain(["only"]).range([mainColor]))
			.dimension(intUseDim)
			.group(intUseDim.group())
			.valueAccessor(function(d) {
				return d.value/intUseDim.top(Infinity).length;
				})
			.elasticX(true)
			.renderTitle(true)
			.title(function() { return "How often to you use the internet?"})
			.xAxis().ticks(4).tickFormat(function(v) { return String(v * 100) + '%'}) ;
		printChart
//			.width(200)
			.height(200)
			.colors(d3.scale.ordinal().domain(["only"]).range([mainColor]))
			.dimension(printUseDim)
			.group(printUseDim.group())
			.valueAccessor(function(d) {
				return d.value/printUseDim.top(Infinity).length;
				})
			.elasticX(true)
			.renderTitle(true)
			.title(function() { return "How often to you read print media?"})
			.xAxis().ticks(4).tickFormat(function(v) { return String(v * 100) + '%'}) ;
		leaningBarChart
			.width(350)
			.height(200)
			.dimension(leanDim)
			.colors(d3.scale.ordinal().domain(["only"]).range([mainColor]))
			.group(leanDim.group())
			.valueAccessor(function(d) {
				return d.value/leanDim.top(Infinity).length;
				})
			.elasticX(true)
			.xAxis().ticks(4).tickFormat(function(v) { return String(v * 100) + '%'}) ;


//		dc.registerChart(internetTreeChart, "main");
		dc.renderAll("main");

		dc.redrawAll();

	}
//set what happens when tour button is clicked

	tour.init();
	tour.start();
	d3.select("#tour").on("click",function() {
			tour.restart();
		});




});
