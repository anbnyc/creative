const pi = Math.PI;
var svg = d3.select("svg");
var path = d3.geoPath();
const bigStateRadius = 50;
const littleStateRadius = 20;

d3.queue()
  .defer(d3.json, "https://d3js.org/us-10m.v1.json")
  .defer(d3.json, './states.json')
  .awaitAll(function(error, results){
    run(results[0], results[1])
  })

function run(us, states){

  var current;
  var features = topojson.feature(us, us.objects.states).features;
  features.forEach(e => {
    states[e.id] = Object.assign({}, states[e.id], e, { n_neighbors: states[e.id].neighbors.length, center: path.centroid(e) })
  })
  for(var k in states){
    const s = states[k];
    s.dir_neighbors = s.neighbors.length 
      ? s.neighbors
        .map(o => Math.atan2(states[o].center[1] - s.center[1], states[o].center[0] - s.center[0]) * 180 / Math.PI) 
        .map(o => o < 0 ? 360 + o : o)
      : []
  }

  var countryMap = svg.append("g")
    .attr("class","country-map")
    .selectAll(".country-state")
    .data(Object.values(states));
  var countryGroups = countryMap.enter().append("g")
    .attr("class","country-state")
    .attr("transform", d => "translate("+d.center[0]+","+d.center[1]+")" )
    .on('click', function(d){
      current = d.id;
      drawDetailMap();
    });
  countryGroups
    .append("polygon")
    .attr("points",d => createPointsPoly(d.n_neighbors, 20).map(o => o.join(",")).join(" "));
  countryGroups
    .append("text")
    .attr("x", -10)
    .attr("y", 5)
    .text(d => d.abbr)
  
  function drawDetailMap(){

    const t = d3.transition()
      .duration(5000);
    var currentState = states[current]
    var neighbors = [...currentState.neighbors]
      .sort((a,b) => 
        currentState.dir_neighbors[currentState.neighbors.indexOf(a)]
        - currentState.dir_neighbors[currentState.neighbors.indexOf(b)]
      );
    const bigStateSideLen = getSideGivenRadius(neighbors.length, bigStateRadius);

    var detailMapData = svg.selectAll(".detail-map")
      .data([currentState], d => d.id);
    detailMapData.exit().transition(t).style("opacity",0).remove();
    var detailMap = detailMapData
      .enter().append("g")
      .attr("class","detail-map");

    var bigState = detailMap.append("g")
      .attr("class","detail-state big-state")
      .attr("transform", d => "translate("+d.center[0]+","+d.center[1]+")");
    bigState.append("polygon")
      .attr("points",d => createPointsPoly(d.n_neighbors, littleStateRadius).map(o => o.join(",")).join(" "));
    bigState.append("text")
      .attr("x", -10)
      .attr("y", 5)
      .text(d => d.abbr)
    bigState.transition(t)
      .attr("transform","translate(0,0)")
    bigState.select("polygon")
      .transition(t)
      .attr("points",d => createPointsPoly(d.n_neighbors, bigStateRadius).map(o => o.join(",")).join(" "));

    var neighborPolyData = detailMap
      .selectAll(".neighbor-state")
      .data(neighbors, d => d.id);
    var neighborPoly = neighborPolyData
      .enter().append("g")
      .attr("class","detail-state neighbor-state")
      .on('click', function(d){
        current = d;
        drawDetailMap();
      });
    neighborPoly
      .merge(neighborPolyData)
      .attr("transform", d => "translate("+states[d].center[0]+","+states[d].center[1]+")")
      .transition(t)
      .attr("transform", (d,i) => 
        getPositionBySide(i, currentState.n_neighbors, bigStateRadius, states[d].n_neighbors, bigStateSideLen))
    neighborPoly.append("polygon")
      .attr("points", d => createPointsPoly(states[d].n_neighbors, littleStateRadius))
      .transition(t)
      .attr("points", d => createPointsPoly(
        states[d].n_neighbors, 
        getRadiusGivenSide(states[d].n_neighbors, bigStateSideLen)
      ));

    detailMap.selectAll(".neighbor-state")
      .append("text")
      .attr("x", -10)
      .attr("y", 5)
      .attr("transform", (d,i) => 
        "rotate("+ -180/pi * getRotateAngle(getAngleBySide(i, neighbors.length), states[d].n_neighbors)+")")
      .text(d => states[d].abbr)

    detailMap
      .transition(t)
      .attr("transform","translate(1150, 200)")
  }
}

function createPointsPoly(n, radius) {
    var base = 2 * pi / n;
    var poly = new Array();
    for(var i = 0; i < n; i++) {
        var fi_i = base * i + 0;
        poly.push([
          radius * Math.cos(fi_i),
          radius * Math.sin(fi_i) 
        ]);
    }
    return poly;
}

function getPositionBySide(index, totalNeighbors, bigStateRadius, nSides, bigStateSideLen){
  var angle = getAngleBySide(index, totalNeighbors);
  var rotateAngle = getRotateAngle(angle, nSides);
  var littleStateRadius = getRadiusGivenSide(nSides, bigStateSideLen);
  var littleStateApothem = getApothemGivenRadius(nSides, littleStateRadius)
  var bigStateApothem = getApothemGivenRadius(totalNeighbors, bigStateRadius);
  var x = Math.cos(angle)*(bigStateApothem + littleStateApothem);
  var y = Math.sin(angle)*(bigStateApothem + littleStateApothem);
  return "translate("+x+","+y+")" + " rotate("+(180/pi * rotateAngle)+")";
}

function getAngleBySide(index, totalNeighbors){
  return index*(2*pi/totalNeighbors) + (2*pi / totalNeighbors / 2)
}

function getRotateAngle(theta, nSides){
  return nSides % 2 === 0 ? (theta + (2*pi / nSides / 2)) : theta
}

function getApothemGivenRadius(nSides, radius){
  return radius * Math.cos(pi/nSides);
}

function getRadiusGivenSide(nSides, sideLen){
  return sideLen / (2*Math.sin(pi/nSides));
}

function getSideGivenRadius(nSides, radius){
  return radius * 2*Math.sin(pi/nSides);
}