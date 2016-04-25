
d3.select(window).on("resize",sizeChange);
$(document).ready(function() {
// bring in survey data; will be available within the call
	var surveyData;

	d3.json("data/surveyResponse.json", function(error, json) {
		if(error) return console.warn(error);
		surveyData = json;
		visualizeit(surveyData);

	});
	function visualizeit(surveyData) {
	// Bring the Survey Data into crossfilter
//		var surveyDataXF = crossfilter(surveyData);

	// Create our dimension by Oblast
//		var oblastXF = surveyDataXF.dimension(function(ob) {
//			console.log('created dimension for Oblast');
//			return ob.v175; 
//		});

	// Group by educational level
//	 	var groupByEdu = oblastXF.group();
//		console.log('grouped');
//	 	groupByEdu.top(Infinity).forEach(function(ob, i) {
  //  		console.log(ob.key + ": " + ob.value);
	// 	});

	}
	var width = parseInt(d3.select('#map').style('width')),
		height = width * .7;

	var geometry_center =  {"latitude": 48.360833, "longitude": 31.1809725};
	var geography_center = {"latitude": 49.0275, "longitude": 31.482778};

// create the variable to append the svg to the map class in the html
	var svg = d3.select("body").selectAll("#map").append("left").append("svg")
		.attr("width", width)
		.attr("height", height)
			.append("g");

// create the variable to set the map projection and scale
	var projection = d3.geo.conicEqualArea()
		.center([0, geometry_center.latitude])
		.rotate([-geometry_center.longitude, 0])
		.parallels([46, 52])  // vsapsai: selected these parallels myself, most likely they are wrong.
		.scale(width * 4.5)
		.translate([width / 2, height / 2]);
	var path = d3.geo.path()
		.projection(projection);

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



	d3.select(self.frameElement)
		.style("width", width + "px")
		.style("height", "800px");
});
function sizeChange() {
	d3.select("g").attr("transform","scale(" + $("#map").width()/450 + ")");
	$("svg").height($("#map").width()*0.7);
	$("svg").width($("#map").width());


	
}

