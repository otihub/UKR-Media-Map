
$(document).ready(function() {

	var canvas = d3.select("body").append("svg")
		.attr("width", 760)
		.attr("height", 700)

	d3.json("../data/ukrNatEarth110m.json", function(data){
		var group = canvas.selectAll("g")
			.data(data.features)
			.enter()
			.append("g")

	var projection = d3.geo.mercator().scale(150,000);
		var path = d3.geo.path().projection(projection)
		var areas = group.append("path")
			.attr("d", path)
			.attr("class", "area")
			.attr("fill", "black");
	});

});
