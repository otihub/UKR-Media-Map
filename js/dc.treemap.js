dc.treeChart =  function (parent, chartGroup) {
  	var color = d3.scale.category20c();

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



				var parentDim =  d3.select(this.anchor()).node().getBoundingClientRect();
				parentWidth = parentDim.width;
        parentHeight = parentDim.height;

				group = _chart.dimension().group().reduceCount().all();
				_chart.selectAll("div").remove();
				var treemap = d3.layout.treemap()
			//		.size([parentWidth,_chart.height()])
          .size([parentWidth,parentHeight])
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
				//		return d.name=='tree' ?'#fff': color( d.key );
						return '#191919';
					})
					.append('div')
					.html(function(d) {console.log(d.key);return "<div data-toggle='tooltip' data-placement='top' title=" + "'" + String(d.key)  + ' ' +  String(d.value) + "'" + ">" + d.key + "<br />" + d.value + "</div>"; })

				};

			_chart._doRedraw = function() {
				return _chart._doRender();
			};

			return _chart.anchor(parent, chartGroup)
		}
