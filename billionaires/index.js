let centers = "source"
var link, node;
const h = .9*window.innerHeight, 
      w = .9*window.innerWidth, 
      m = 50, 
      r = 6, 
      t = 2000;

fetch('https://api.myjson.com/bins/ecg0t')
  .then(d => d.json())
  .then(raw => {
    let links = []
    raw.people.forEach(p => {
      if(Array.isArray(p[centers])){
        p[centers].forEach(s => links.push({ source: p.name, target: s }) )
      } else {
        links.push({ source: p.name, target: p[centers] })
      }
    });
    let data = {
      "nodes": [
        ...raw.people.map(o => Object.assign({}, o, { id: o.name, center: false })),
        ...raw[centers].map(o => ({ id: o, center: true }))
      ],
      "links": links
    }

    xScale.domain(d3.extent(raw.people.map(o => o.age)))
    yScale.domain(d3.extent(raw.people.map(o => o.networth)))
    rScale.domain(yScale.domain())
    
    setup(data)
  })

let xScale = d3.scaleLinear()
  .range([m, w - m])
let yScale = d3.scaleLog()
  .range([h - m, m])
let color = d3.scaleOrdinal(d3.schemeCategory20)
let rScale = d3.scaleLog()
  .range([.5*r, 3*r])

let svg = d3.select("svg")
  .attr("height",h)
  .attr("width",w)
  .append("g")
  .attr("class","body")

let simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }).strength(1))
    .force("charge", d3.forceManyBody().strength(-1))
    .force("center", d3.forceCenter(w / 2, h / 2));

function setup(data){

  document.getElementById("force").addEventListener("click", function(){
    forceReset(data)
  })
  document.getElementById("scatter").addEventListener("click", function(){
    scatterLayout(data)
  })

  link = svg.append("g")
      .attr("class", "links")
    .selectAll("line")
    .data(data.links)
    .enter().append("line");

  node = svg.append("g")
      .attr("class", "nodes")
    .selectAll("g")
    .data(data.nodes, d => d.id)
    .enter().append("g")
    .attr("class","node")

  node.append("circle")
    .attr("r", d => d.center ? r : rScale(d.networth))
    .attr("fill", d => d.center ? "white" : color(d.country))
    .attr("stroke", d => !d.center || (d.id.substr(0,1).toUpperCase() === d.id.substr(0,1)) ? "black" : "#999")
    .on('mouseover', function(){
      d3.select(this.parentNode).classed("hovered", true)
    })
    .on('mouseout', function(){
      d3.select(this.parentNode).classed("hovered", false)
    })
      
  node.call(d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended));

  node.append("text")
    .attr("x", d => d.center ? r : rScale(d.networth))
    .text(function(d) { return d.id; });

  simulation
    .nodes(data.nodes)
    .on("tick", ticked);

  simulation.force("link")
    .links(data.links);
}

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}

function forceReset(){
  link
    .transition()
    .delay(t)
    .duration(t)
    .style("opacity",1);

  node
    .transition()
    .duration(t)
    .attr("r", d => d.center ? r : rScale(d.networth))
    .attr("transform",d => "translate("+d.x+","+d.y+")")
    .transition()
    .duration(t)
    .style("opacity",1)

  setTimeout(function(){
    simulation.restart();
  }, t)
}

function ticked() {
  link
    .attr("x1", function(d) { return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { return d.target.x; })
    .attr("y2", function(d) { return d.target.y; });

  node
    .attr("transform", function(d){
      d.x = Math.max(r, Math.min(w - r, d.x))
      d.y = Math.max(r, Math.min(h - r, d.y))
      
      return "translate("+
      d.x
      +","+
      d.y
      +")"
    })
}

function scatterLayout(data){
  simulation.stop();
	let people = data.nodes.filter(d => !d.center);

	let groups = d3.selectAll("g.node")
		.data(people, d => d.id);

	link
		.transition()
		.duration(t)
		.style("opacity",0);

	groups.exit()
		.transition()
		.duration(t)
		.attr("r",0)
		.style("opacity",0);

	groups
		.transition()
		.delay(t)
		.duration(t)
    .attr("transform",d => "translate("+xScale(d.age)+","+yScale(d.networth)+")")
}