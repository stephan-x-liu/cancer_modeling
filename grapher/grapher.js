

var height = 7;
var width =18; // square root of number of nodes
var pheight = 12;
var pwidth = 3; //size of each node (pixel)
var margin = 4;
var nodes = [];
var data = [];
var w = width * pwidth;
var h = height * pheight;
var color = d3.scale.linear()
  .range(["#a50026","#ffffbf","#74add1"]);
var M;
var S;
var L;
var Mdat;
var Ldat;
var Sdat;
var max = -10000;
var min = 10000;
var lambdas;


$(function(){
  svg = svg_init();

  $( "#slider" ).slider({
    value:0,
    min: 0,
    max: 15,
    step: 1,
    slide: function( event, ui ) {
      lambda = lambdas[ui.value];
      $( "#lambda" ).val( ""+lambda );
      update([Mdat, Ldat[lambda], Sdat[lambda]]);
    }
  });
  

  $.getJSON("max_min.json?callback=ret", null, function(datas){
    max = parseFloat(datas['max_value']);
    min = parseFloat(datas['min_value']);
    color.domain([min*1000, (max+min)/2*1000, max*1000])
  })
  $.getJSON("lambdas.json?callback=ret", null, function(datas){
    lambdas = datas;
    $( "#lambda" ).val( ""+ lambdas[$( "#slider" ).slider("value")] );
  });
  $.getJSON("M.json?callback=ret", null, function(datas){
    Mdat = datas;
    console.log(Mdat)
    for(var i = 0; i < 15; i++){
      draw_block(node_gen(Mdat[i], i, 0), svg);
    }
  });
  $.getJSON("L.json?callback=ret", null, function(datas){
    Ldat = datas;
    L_init = Ldat[lambdas[0]]
    for(var i = 0; i < 15; i++){
      draw_block(node_gen(L_init[i], i, 1), svg);
    }
  });
  $.getJSON("S.json?callback=ret", null, function(datas){
    Sdat = datas;
    S_init = Sdat[lambdas[0]]
    for(var i = 0; i < 15; i++){
      draw_block(node_gen(S_init[i], i, 2), svg);
    }
  });
});

function run(){
  

  
  S_init = Sdat[lambdas[0]];
  L_init = Ldat[lambdas[0]];
  for(var i = 0; i < 15; i++){
    draw_block(node_gen(Mdat[i], i, 0));
    draw_block(node_gen(L_init[i], i, 0));
    draw_block(node_gen(S_init[i], i, 0));
  }
}
function ret(data){
  return data;
}

function node_gen(data, cell_line, ty){
  console.log(data)
  var temp = [];
  for(var i = 0; i < height; i++){
    for(var k = 0; k < width; k++)
    temp.push({
      x: k,
      y: i,
      z: cell_line,
      type: ty,
      id: "x"+k+"y"+i+"z"+cell_line+"t"+ty,
      value: (data[i][k]*1000)
    });
  }
  return temp;
}
 
function rgb(array){
  return 'rgb('+ array.map(function(r){return Math.round(r);}).join(',') +')';
}

function svg_init(){
  var div = d3.select('body').select('#svg-div');
  var svg = div.append('svg')
      .attr('width', (margin*16)+(pwidth*width*15))
      .attr('height', 20+(pheight*height*3))
      .attr('preserveAspectRatio','xMidYMin')
      .style("border-radius","10px")
      .style("border","1px solid black")
      .style('display','block')
      .style('margin','auto');
  return svg;
}
function draw_block(nodes, svg){

  var nodes = svg.append('g')
    .attr('transform', transform_str(nodes))
    .selectAll('rect')
    .data(nodes)
    .enter().append('rect')
      .attr('node', function(node){return node;})
      .attr('x', function(node){return node.x * pwidth;})
      .attr('y', function(node){return node.y * pheight;})
      .attr('width', pwidth)
      .attr('height', pheight)
      .style('fill', function(node){return color(node.value);})
  return nodes;
}


   

function update(data){
  var i = -1;
  console.log(svg.selectAll('rect'))
  svg.selectAll('rect').transition().style('fill', function(n){
    return color(data[n.type][n.z][n.y][n.x]*1000);
  });
}

function transform_str(nodes){
  var x_transform = nodes[0].z * (pwidth * width + margin) + margin;
  var y_transform = nodes[0].type * (pheight * height + 5) + 5;
  return 'translate(' + x_transform +', ' + y_transform + ')';
}


