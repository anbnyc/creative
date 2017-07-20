var inW = 300;
var inH = 200;
var ratio = 5;
var reso, memory, iterate, timeout, step;
var data = [];
var intervals = [];

var outW = inW*ratio;
var outH = inH*ratio;
var canvasIn = document.getElementById("input");
canvasIn.width = inW;
canvasIn.height = inH;
var canvasOut = document.getElementById("output")
canvasOut.width = outW;
canvasOut.height = outH;

var ctxIn = canvasIn.getContext("2d")
var context = canvasOut.getContext("2d")
const { offsetTop, offsetLeft } = canvasIn;
document.getElementById("reset").addEventListener('click',reset);
document.getElementById("start").addEventListener('click',start);

canvasIn.addEventListener('mouseenter', () => {
  iterate = document.getElementById("iter").checked;
  reso = +document.getElementById("reso").value;
  step = +document.getElementById("step").value;
  memory = document.getElementById("memo").checked;
})

function start(){
  if(iterate){
    intervals.push(setInterval(() => {
      if(reso > 100 || reso <= 0){ 
        stopAll();
      } else {
        animate();
        reso += step;
      }
    }, document.getElementById("freq").value)); 
  }
}

canvasIn.addEventListener('mousemove', e => {
  const { pageX: x, pageY: y } = e
  data.push({ x: x - offsetLeft, y: y - offsetTop })
  inputDraw();
  if(!iterate){
    animate();
  }
})

function inputDraw(){
  ctxIn.beginPath();
  ctxIn.lineWidth = 1;
  ctxIn.strokeStyle = "black";
  data.map(o => ctxIn.lineTo(o.x, o.y))
  ctxIn.stroke();
  ctxIn.closePath();
}

function animate(){
  if(!memory) context.clearRect(0, 0, outW, outH);
  for(var i = 0; i < reso; i++){
    for(var j = 0; j < reso; j++){
      var x = i*inW*(ratio/reso)
      var y = j*inH*(ratio/reso)
      context.moveTo(x,y);
      context.beginPath();
      context.lineWidth = 1;
      context.strokeStyle = "black";
      data.map(o => 
        context.lineTo(
          x+o.x*(ratio/reso), 
          y+o.y*(ratio/reso)
        ))
      context.stroke();
      context.closePath();
    }
  }
}

function reset(){
  stopAll();
  data = [];
  intervals = [];
  reso = +document.getElementById("reso").value;
  ctxIn.clearRect(0, 0, outW, outH);
  context.clearRect(0, 0, outW, outH);
}

function stopAll(){
  intervals.map(o => clearTimeout(o))
}