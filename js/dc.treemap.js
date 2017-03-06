dc.treeChart =  function (parent, chartGroup) {
  	var color = d3.scale.category20c();

		var _chart = dc.marginMixin(dc.colorMixin(dc.baseMixin({})));
			//Makes into tree structure
		function makeTree (json) {
				json = {"name":"tree","children":json};
      //  console.log(json);
				return json;
			}




//getter method for getting list of to make tree structure
    var _groupList = {};
      _chart.groupList = function(_) {

        if (typeof(_) == 'object') {

          _groupList = _;
        } else {

          return _;
        }
        return _chart;

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

        console.log(Object.keys(_groupList).length)

				var parentDim =  d3.select(this.anchor()).node().getBoundingClientRect();
				parentWidth = parentDim.width;
        parentHeight = parentDim.height;
      //check to see if chart is fed objectList
      var group = {};
      var tree = {};
      group = _chart.dimension().group().reduceCount().all();
      tree = makeTree(removeUnwanted(group, _removeThese))
    
    /*   if  (Object.keys(_groupList).length == 0) {
          console.log("nobuttman")
				    group = _chart.dimension().group().reduceCount().all();
            group = makeTree(removeUnwanted(group, _removeThese))

          }
        else {
          console.log("buttman")
            group = _chart.dimension().group().reduce(
              function reduceAdd (p,d) {
               console.log(p)

              },
              function reduceRemove (p,d){

              },
              function reduceInitial () {
                return {"name":"tree",
                        "children":[
                        {
                        "name":"russian",
                        "children":[
                          {}
                        ]
                        },
                        {
                        "name":"english",
                        "children":[
                          {}
                        ]
                      }
                      ]
                    }
              }
          )
        }
*/
				_chart.selectAll("div").remove();
				var treemap = d3.layout.treemap()
			//		.size([parentWidth,_chart.height()])
          .size([parentWidth,parentHeight])
					.sticky(false)
					.value(function(d) { return d.value;});
				var node = _chart.root()
					.datum(tree)
					.selectAll(".node")
					.data(treemap.nodes)
					.enter().append("div")
					.attr("class","node")
					.call(position)
	//				.style("background-color", function(d) {
				//		return d.name=='tree' ?'#fff': color( d.key );
		//				return '#191919';
			//		})
					.append('div')
					.html(function(d) {return "<div data-toggle='tooltip' data-placement='top' title=" + "'" + String(d.key)  + ' ' +  String(d.value) + "'" + ">" + d.key + "<br />" + d.value + "</div>"; })

				};

			_chart._doRedraw = function() {
				return _chart._doRender();
			};

			return _chart.anchor(parent, chartGroup)
		}
