$(document).ready(function() {
		var geometry_center =  {"latitude": 48.360833, "longitude": 31.1809725};
		var geography_center = {"latitude": 49.0275, "longitude": 31.482778};

		var width = parseInt(d3.select('#map').style('width')),
			mapRatio = .7,
			height = width * mapRatio;
		console.log("width is " + width)

		d3.select("#drawer").style("height",height + "px");
		var projection = d3.geo.conicEqualArea()
			.center([0, geometry_center.latitude])
			.rotate([-geometry_center.longitude, 0])
			.parallels([46, 52]);  // vsapsai: selected these parallels myself, most likely they are wrong.
		var path = d3.geo.path()
			.projection(projection);
		console.log(height)
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
			var gender = cf.dimension(function(d) {return d.v2;})
			var genderGroup = gender.group();

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
			console.log("width: " + width + " height: " + height)
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
