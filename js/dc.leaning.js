dc.leaningChart =  function (parent, chartGroup) {
	var _chart = dc.marginMixin(dc.colorMixin(dc.baseMixin({})));
	var lineFunction = d3.svg.line()
		.x(function(d) { return d.x; })
 		.y(function(d) { return d.y; })
 		.interpolate("linear");
	//d3 scale to move from problem space to 01
	var scale = d3.scale.linear().domain([1,3]);
	var transition = d3.transition().duration(750);

	var calcAverage = function(group, notInclude) {
    var total = 0;
    var numerator = 0;
    for (i=0; i < group.length; i++) {
        if (notInclude.indexOf(group[i].key) == -1) {
            total += group[i].value;
            numerator += group[i].value * group[i].key;
          }
      }
      return numerator/total;
		}

	_chart._doRender = function() {

		var width = _chart.width() * .7;
		var height = _chart.height();
		var radius = 4.5;
		lineData = [{"x":radius,"y":height/2},{"x":width-radius,"y":height/2}]
// how far to move dot along the lineData
		var dist = scale(calcAverage(_chart.group(),[99]));
//svg portal
		var svg = _chart.root().append("svg")
			.attr("width",width)
			.attr("height", height);

//attach the line to svg
	 	svg.append("path").attr("class", "line grid-line").attr("d",lineFunction(lineData)).attr("id","leaningLine");
//attach a circle to the line.attr("id","leaningLine")
	 	svg.append("circle").attr("cx",width * dist).attr("cy",height/2).attr("r",radius).attr("id","leaningCirc");

	};

	_chart._doRedraw = function() {
		var width = _chart.width() * .7;
		var dist = scale(calcAverage(_chart.group(),[99]));
		d3.select("#leaningCirc").transition(transition).attr("cx",width * dist);
	};

	return _chart.anchor(parent, chartGroup)
}
