opentype.load('fonts/helvetica-bold-5957c7b8b6d02.ttf', function(err, font) {
	if (err) {
			alert('Could not load font: ' + err);
	} else {
			getDefs(font, fontLoaded);
	}
});

function getDefs(font, callback){
	var defs = {}
	var colors = {
		"A" : "#0039A6",
		"C" : "#0039A6",
		"E" : "#0039A6",
		"B" : "#FF6319",
		"D" : "#FF6319",
		"F" : "#FF6319",
		"M" : "#FF6319",
		"G" : "#6CBE45",
		"J" : "#996633",
		"Z" : "#996633",
		"L" : "#A7A9AC",
		"N" : "#FCCC0A",
		"Q" : "#FCCC0A",
		"R" : "#FCCC0A",
		"S" : "#808183",
		"1" : "#EE352E",
		"2" : "#EE352E",
		"3" : "#EE352E",
		"4" : "#00933C",
		"5" : "#00933C",
		"6" : "#00933C",
		"7" : "#B933AD"
	}

	for(var k in colors){
		defs[k] = {
			color: colors[k],
			path: font.getPath(k,0,250,300).toPathData().replace(/\s/g,",")
		}
	}
	
	callback(font, defs)
}

function fontLoaded(font, defs){

	var keys = Object.keys(defs);
	var start = "A";
	d3.select("circle")
		.attr("fill",defs[start].color);
	d3.select("path")
		.attr("d", defs[start].path);

	setInterval(function(){
		var t = d3.transition()
			.duration(2000);
		var end = keys[Math.floor(Math.random()*keys.length)];
		d3.select("path")
			.transition(t)
				.attrTween('d', function(){
					return d3.interpolatePath(d3.select(this).attr("d"), defs[end].path)
				})
		
		d3.select("circle")
			.transition(t)
				.attrTween('fill', function(){
					return d3.interpolateRgb(d3.select(this).attr("fill"), defs[end].color);
				})
	}, 5000)
}