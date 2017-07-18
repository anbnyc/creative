const pi = Math.PI
var svg = d3.select("svg");
var path = d3.geoPath();
// var states = 


d3.queue()
  .defer(d3.json, "https://d3js.org/us-10m.v1.json")
  .defer(d3.json, './states.json')
  .awaitAll(function(error, results){
    run(results[0], results[1])
  })

//https://bl.ocks.org/mbostock/4090848
function run(us, states){

  var current
  var path = d3.geoPath();
  var features = topojson.feature(us, us.objects.states).features;
  features.forEach(e => {
    states[e.id] = Object.assign(
      {}, 
      states[e.id], 
      e, 
      { n_neighbors: states[e.id].neighbors.length, center: path.centroid(e) }
    )
  })
  for(var k in states){
    const s = states[k];
    //https://gist.github.com/conorbuck/2606166
    s.dir_neighbors = s.neighbors.length 
      ? s.neighbors
        .map(o => Math.atan2(states[o].center[1] - s.center[1], states[o].center[0] - s.center[0]) * 180 / Math.PI) 
        .map(o => o < 0 ? 360 + o : o)
      : []
  }
  
  var detailMap = svg.append("g")
    .attr("class","detail-map")
    .attr("transform","translate(1200,400)");

  var countryMap = svg.append("g")
    .attr("class","country-map")
    .attr("transform","translate(0,100)")
    .selectAll(".state")
    .data(Object.values(states));
  var countryGroups = countryMap.enter().append("g")
    .attr("class","state")
    .attr("transform", d => "translate("+d.center[0]+","+d.center[1]+")" );
  var countryStates = countryGroups
    .append("polygon")
    .attr("points",d => createPointsPoly(d.n_neighbors, 20).map(o => o.join(",")).join(" "))
    .on('click', function(d){
      current = d.id;
      drawDetailMap()
    });
  
  function drawDetailMap(){

    var currentState = states[current]
    var neighbors = [...states[current].neighbors]
      .sort((a,b) => 
        currentState.dir_neighbors[currentState.neighbors.indexOf(a)]
        - currentState.dir_neighbors[currentState.neighbors.indexOf(b)]
      );
    const bigStateRadius = 100;
    const bigStateSideLen = getSideGivenRadius(neighbors.length, bigStateRadius);

    var bigStateData = detailMap.selectAll(".big-state")
      .data([currentState], d => d.id)
    bigStateData.exit().remove();
    var bigState = bigStateData
      .enter().append("polygon")
      .attr("class","big-state")
      .attr("points",d => createPointsPoly(d.n_neighbors, 100).map(o => o.join(",")).join(" "));

    var neighborPolyData = detailMap
      .selectAll(".neighbor")
      .data(neighbors, d => d.id);
    neighborPolyData.exit().remove();
    var neighborPoly = neighborPolyData
      .enter().append("polygon")
      .attr("class","neighbor");
    neighborPoly
      .merge(neighborPolyData)
      .attr("transform", (d,i) => 
        getPositionBySide(i, currentState.n_neighbors, bigStateRadius, states[d].n_neighbors, bigStateSideLen))
      .attr("points", d => createPointsPoly(
        states[d].n_neighbors, 
        getRadiusGivenSide(states[d].n_neighbors, bigStateSideLen)
      ));
  }

}

  
//https://gist.github.com/davidegazze/56bc005090be06ccf545
function createPointsPoly(n, radius) {
    var base = 2 * pi / n;
    var poly = new Array();
    
    for(var i = 0; i < n; i++) {
        var fi_i = base * i + 0; //set origin
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
  var ret = "translate("+x+","+y+")"
    + " rotate("+(180/pi * rotateAngle)+")";
  return ret;
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