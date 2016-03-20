$(document).ready(function() {

	var width = 900,
		height = 570;

	var geometry_center =  {"latitude": 48.360833, "longitude": 31.1809725};
	var geography_center = {"latitude": 49.0275, "longitude": 31.482778};

// create the variable to append the svg to the map class in the html
	var svg = d3.select("body").selectAll(".map").append("left").append("svg")
		.attr("width", width)
		.attr("height", height);

// create the variable to set the map projection and scale
	var projection = d3.geo.conicEqualArea()
		.center([0, geometry_center.latitude])
		.rotate([-geometry_center.longitude, 0])
		.parallels([46, 52])  // vsapsai: selected these parallels myself, most likely they are wrong.
		.scale(3920)
		.translate([width / 2, height / 2]);
	var path = d3.geo.path()
		.projection(projection);

	var topo_data = null;

	d3.json("../data/ukraine.json", function(error, ukraine_data) {
		topo_data = ukraine_data;

		var countries = topojson.feature(ukraine_data, ukraine_data.objects.countries);
		svg.selectAll(".country")
			.data(countries.features)
		  .enter().append("path")
			.attr("class", function(d) { return "country " + d.id; })
			.attr("d", path);

		svg.append("path")
			.datum(topojson.mesh(ukraine_data, ukraine_data.objects.countries, function(a, b) { return a !== b; }))
			.attr("class", "country-boundary")
			.attr("d", path);
		svg.append("path")
			.datum(topojson.mesh(ukraine_data, ukraine_data.objects.countries, function(a, b) { return a === b; }))
			.attr("class", "coastline")
			.attr("d", path);

		var water_group = svg.append("g")
			.attr("id", "water-resources");

		var rivers = topojson.feature(ukraine_data, ukraine_data.objects.rivers);
		water_group.selectAll(".river")
			.data(rivers.features)
		  .enter().append("path")
			.attr("class", "river")
			.attr("name", function(d) { return d.properties.name; })
			.attr("d", path);

		// Add lakes after rivers so that river lines connect reservoirs, not cross them.
		var lakes = topojson.feature(ukraine_data, ukraine_data.objects.lakes);
		water_group.selectAll(".lake")
			.data(lakes.features)
		  .enter().append("path")
			.attr("class", "lake")  // Note: not necessary a lake, it can be a reservoir.
			.attr("name", function(d) { return d.properties.name; })
			.attr("d", path);

		var regions = topojson.feature(ukraine_data, ukraine_data.objects.regions);
		svg.selectAll(".region")
			.data(regions.features)
		  .enter().append("path")
			.classed("region", true)
			.attr("id", function(d) { return d.id; })
			.attr("d", path);
		svg.append("path")
			.datum(topojson.mesh(ukraine_data, ukraine_data.objects.regions, function(a, b) { return a !== b; }))
			.classed("region-boundary", true)
			.attr("d", path);
});


// 		d3.select("body").selectAll("div.map").append("ul")
// 			.classed("regions-list", true)
// 			.selectAll("a")
// 			.data(regions.features.sort(function(a, b) {
// 				return a.properties.name.localeCompare(b.properties.name); }))
// 		  .enter().append("li").append("a")
// 			.text(function(d) { return d.properties.name; })
// 			.attr("href", "javascript:void(0)")
// 			.on("click", function(d) {
// 				highlightRegion(d.id);
// 				d3.event.stopPropagation();
// 			});
// 		window.addEventListener("click", clearRegionHighlight);
// }

	d3.select(self.frameElement)
		.style("width", width + "px")
		.style("height", "800px");

});