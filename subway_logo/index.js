opentype.load('fonts/helvetica-bold-5957c7b8b6d02.ttf', function(err, font) {
	if (err) {
			alert('Could not load font: ' + err);
	} else {
			getDefs(font, fontLoaded);
	}
});

function getDefs(font, callback){
	var defs = {}
	var fontSize = 300
	var scale = 1 / font.unitsPerEm * fontSize
	var colors = {
		"C" : "#0039A6",
		"E" : "#0039A6",
		"F" : "#FF6319",
		"M" : "#FF6319",
		"G" : "#6CBE45",
		"J" : "#996633",
		"Z" : "#996633",
		"L" : "#A7A9AC",
		"N" : "#FCCC0A",
		"S" : "#808183",
		"1" : "#EE352E",
		"2" : "#EE352E",
		"3" : "#EE352E",
		"5" : "#00933C",
		"7" : "#B933AD",
		// "A" : "#0039A6",
		// "B" : "#FF6319",
		// "D" : "#FF6319",
		// "Q" : "#FCCC0A",
		// "R" : "#FCCC0A",
		// "4" : "#00933C",
		// "6" : "#00933C",
	}

	for(var k in colors){
		const glyph = font.charToGlyph(k)
		const path = glyph.getPath(0,300,fontSize)
		defs[k] = {
			color: colors[k],
			points: path.commands, //reorderCommands(path.commands),
			path: path.toPathData().replace(/\s/g,","),
			bbox: glyph.getBoundingBox()
		}
		defs[k].xOffset = 200 - scale*defs[k].bbox.x1 - scale*.5*(defs[k].bbox.x2 - defs[k].bbox.x1)
		defs[k].yOffset = 0 //100 - scale*defs[k].bbox.y1 - scale*.5*(defs[k].bbox.y2 - defs[k].bbox.y1)
	}
	callback(font, defs)
}

// function reorderCommands(commands){
// 	const commandTypes = commands.map(o => o.type);
// 	if(commandTypes.filter(o => o === "Z").length > 1){
// 		const startOfMainSection = 0;
// 		for(var i = 0; i < commandTypes.length - 1; i++){
// 			if(commandTypes === "Z") startOfMainSection = i+1
// 		}
// 		return [...commands.slice(startOfMainSection), ...commands.slice(0, startOfMainSection - 1)]
// 	} else {
// 		return commands;
// 	}
// }

function fontLoaded(font, defs){

	var keys = Object.keys(defs);
	var line = d3.line()
	  .curve(d3.curveLinear)
	  .x(d => d.x)
	  .y(d => d.y);

	var start = "F";
	d3.select("circle")
		.attr("fill",defs[start].color);
	d3.select("path")
		.attr("d", defs[start].path);

	setInterval(function(){
		var t = d3.transition().duration(1000);
		var end = keys[Math.floor(Math.random()*keys.length)];

		d3.select(".path")
			.transition(t)
				.attrTween('transform', function(){
					return d3.interpolateTransformSvg(d3.select(this).attr("transform"),
						"translate("+defs[end].xOffset+","+defs[end].yOffset+")")
				})

		d3.select("path")
			.transition(t)
				.attrTween('d', function(){
					return d3.interpolatePath(d3.select(this).attr("d"),
						defs[end].path)
				})
		
		d3.select("circle")
			.transition(t)
				.attrTween('fill', function(){
					return d3.interpolateRgb(d3.select(this).attr("fill"), defs[end].color);
				})
	}, 2000)
}









