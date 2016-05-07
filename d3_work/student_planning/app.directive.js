(function(){

'use strict';

angular.module('plan-app')
  .directive('planDirective', function(){
    return {
        link: link,
        restrict: 'E',
        scope: { 
            data: '=',
            vizWidth: '=',
            vizHeight: '='
        }
    }
    
    function link(scope,element,attr){
      
      var width = scope.vizWidth,
          height = scope.vizHeight;

      var force = d3.layout.force()
          .size([width, height])
          .charge(-400)
          .linkDistance(40)
          .on("tick", tick);

      var drag = force.drag()
          .on("dragstart", dragstart)
          .on("dragend",dragend);

      var svg = d3.select(".vizContainer").append("svg")
          .attr("width", width)
          .attr("height", height);
      force
          .nodes(scope.data)
          .links([])
          .start();
          
      var node = svg.selectAll(".node")
          .data(scope.data)
        .enter().append("circle")
          .attr("class", "node")
          .attr("r", 12)
          .on("dblclick", dblclick)
          .call(drag);

      function tick() {
      node.attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
      }

      function dblclick(d) {
        d3.select(this).classed("fixed", d.fixed = false);
      }

      function dragstart(d) {
        d3.select(this).classed("fixed", d.fixed = true);
      }
      
      function dragend(d){
        d.newX = +d3.select(this).attr("cx");
      }

    }
    
  });
    
})();