

var height = 7;
var width =18; // square root of number of nodes
var pheight = 12;
var pwidth = 3; //size of each node (pixel)
var margin = 40;
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
cell_lines_names = [
  'AU 565',
  'BT 474',
  'HCC 1569',
  'HCC 1954',
  'HCC 202',
  'HCC 70',
  'MCF 7',
  'MDA MB 175',
  'MDA MB 231',
  'MDA MB 361',
  'MDA MB 453',
  'SKBR3',
  'SUM 190PT',
  'SUM 225CWN',
  'UACC 812'
];

protein_names = [
  'AKT_pS473',
  'AKT_pT308',
  'EGFR_pY1173',
  'p85_PI3K',
  'PDK1_pS241',
  'S6_pS235',
  'S6_pS240'
]


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

function cell_line_labels(){
  labels = []
  for(var i = 0; i < cell_lines_names.length; i++){
    labels.push({
      line: i,
      label: cell_lines_names[i]
    });
  }
  return labels;
}

function protein_labels(){
  labels = []
  for(var i = 0; i < protein_names.length; i++){
    labels.push({
      number: i,
      label: protein_names[i]
    });
  }
  return labels;
}
 
function rgb(array){
  return 'rgb('+ array.map(function(r){return Math.round(r);}).join(',') +')';
}

function svg_init(){
  var div = d3.select('body').select('#svg-div');
  var svg = div.append('svg')
      .attr('width', (margin*16)+(pwidth*width*15))
      .attr('height', (margin*4)+(pheight*height*3))
      .attr('preserveAspectRatio','xMidYMin')
      .style("border-radius","10px")
      .style("border","1px solid black")
      .style('display','block')
      .style('margin','auto');
  svg.selectAll('text')
      .data(cell_line_labels())
      .enter().append('text')
        .text(function(node){return node.label;})
        .attr('y', margin/2)
        .attr('x', function(node){
          return margin + (margin+(pwidth*width))*node.line;
        })
        .attr('cell_line', function(node){return node.line;})
        .style('font','12px times');
  return svg;
}
function draw_block(nodes, svg){
  var group = svg.append('g')
    .attr('transform', transform_str(nodes));
  
  group.append('text')
      .attr('y', -3)
      .attr('x', 0)
      .text("DMSO")
      .style('font','6px times');

  group.append('text')
      .attr('y', -3)
      .attr('x', pwidth*width/2)
      .text("LAP")
      .style('font','6px times');

  group.selectAll('text2')
      .data(protein_labels())
      .enter().append('text')
        .text(function(node){return node.label;})
        .attr('y', function(node){return node.number * pheight + pheight/3})
        .attr('x', margin * -1 + 2)
        .style('font','6px times');

  var nodes = group.selectAll('rect')
    .data(nodes)
    .enter().append('rect')
      .attr('node', function(node){return node;})
      .attr('x', function(node){return node.x * pwidth;})
      .attr('y', function(node){return node.y * pheight;})
      .attr('cell_line',function(node){node.z;})
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
  var y_transform = nodes[0].type * (pheight * height + margin) + margin;
  return 'translate(' + x_transform +', ' + y_transform + ')';
}


