

var height;
var width;
var tf = 9;
var pheight = 12; // height of each node (pixels)
var pwidth = 3; // width of each node (pixel)
var margin = 42; // space between cell lines
var nodes = [];
var data = [];
var num_cell_lines;
var w;
var h;
var dmso;
var lap;
var total_width;
var color = d3.scale.linear()
  .range(["#a50026","#ffffbf","#74add1"]);
var M;
var S;
var L;
var i;
var Mdat;
var Ldat;
var Sdat;
var max = -10000;
var min = 10000;
var lambdas;
var lambda;
var drag = d3.behavior.drag()
  .origin(function(d) {return {x: x_scale(d)}})
  .on("dragstart", dragstart)
  .on("drag", drag)
  .on("dragend", dragend);
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
var x_scale;

$(function(){
  $( "#all_button" ).click(function(){
    d3.select("svg").remove();
    L_init = Ldat[lambda];
    S_init = Sdat[lambda];
    draw_all();
  })
  $( "#dmso_button" ).click(function(){
    d3.select("svg").remove();
    L_init = Ldat[lambda];
    S_init = Sdat[lambda];  
    draw_dmso();
  })
  $( "#lap_button" ).click(function(){
    d3.select("svg").remove();
    L_init = Ldat[lambda];
    S_init = Sdat[lambda];
    draw_lap();
  })
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
  });

  $.getJSON("lambdas.json?callback=ret", null, function(datas){
    lambdas = datas;
    lambda = lambdas[$( "#slider" ).slider("value")];
    $( "#lambda" ).val( ""+ lambda );
  });

  $.getJSON("M.json?callback=ret", null, function(datas){
    Mdat = datas;
    $.getJSON("L.json?callback=ret", null, function(datas){
      Ldat = datas;
      L_init = Ldat[lambdas[0]]
      $.getJSON("S.json?callback=ret", null, function(datas){
        Sdat = datas;
        S_init = Sdat[lambdas[0]]
        draw(cell_lines_names, ["DMSO", "LAP"], protein_names);
      });
    }); 
  });
});

function draw(cell_line_names, exp_names, protein_names){
  width = exp_names.length * tf;
  height = protein_names.length;
  w = width * pwidth;
  h = height * pheight;
  num_cell_lines = cell_lines_names.length;
  total_width = num_cell_lines * w + (num_cell_lines * (margin - 1));
  x_scale = d3.scale.ordinal().domain(cell_lines_names).rangePoints([margin, total_width-margin+1]);
  
  svg = svg_init();
  svg.selectAll('g')
    .data(cell_lines_names)
  .enter().append('svg:g')
    .attr('class', 'cell-line')
    .attr('id', function(d) {return d.replace(/ /g,'');})
    .attr('cell_line', function(d) {return d;})
    .call(drag);
  for(var i = 0; i < num_cell_lines; i++){
    M_nodes = node_gen(Mdat[cell_lines_names[i]], i, cell_lines_names[i], protein_names, exp_names, 0);
    L_nodes = node_gen(L_init[cell_lines_names[i]], i, cell_lines_names[i], protein_names, exp_names, 1);
    S_nodes = node_gen(S_init[cell_lines_names[i]], i, cell_lines_names[i], protein_names, exp_names, 2);
    temp = draw_cell_line(M_nodes, L_nodes, S_nodes, svg, cell_lines_names[i], protein_names, exp_names);
  }
}

function ret(data){
  return data;
}

function node_gen(data, line_number, cell_line, protein_names, exp_names, ty){
  var temp = [];
  for(var i = 0; i < protein_names.length; i++){
    for(var k = 0; k < exp_names.length; k++){
      for(var j = 0; j < tf; j++){
        temp.push({
          x: j + k * tf,
          y: i,
          tf: j,
          z: line_number,
          cell_line: cell_line,
          protein: protein_names[i],
          exp: exp_names[k],
          type: ty,
          value: data[protein_names[i]][exp_names[k]][j] * 1000
        });
      }
    }
  }
  return temp;
}


function create_labels(names){
  labels = []
  console.log(names)
  for(var i = 0; i < names.length; i++){
    labels.push({
      number: i,
      label: names[i]
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
      .attr('width', (margin*16)+(w*15))
      .attr('height', (margin*4)+(h*3))
      .attr('preserveAspectRatio','xMidYMin')
      .style("border-radius","10px")
      .style("border","1px solid black")
      .style('display','block')
      .style('margin','auto');
  return svg;
}



function draw_cell_line(m_nodes, l_nodes, s_nodes, svg, cell_line, protein_names, exp_names){
  var group = svg.select("#"+cell_line.replace(/ /g,''));
  group.attr('transform', transform_str_x(m_nodes));
  group.append('text')
    .text(cell_line)
    .attr('y', 20)
    .attr('x', 0)
    .style('font','8px times');
  draw_block(m_nodes, group, protein_names, exp_names);
  draw_block(l_nodes, group, protein_names, exp_names);
  draw_block(s_nodes, group, protein_names, exp_names);
  return group;
}

function draw_block(nodes, g, protein_names, exp_names){
  var group = g.append('g')
    .attr('transform', transform_str_y(nodes));
  group.selectAll('text')
      .data(create_labels(protein_names))
      .enter().append('text')
        .text(function(node){return node.label;})
        .attr('y', function(node){return node.number * pheight + pheight/3})
        .attr('x', margin * -1 + 2)
        .style('font','6px times');

  group.selectAll('text2')
      .data(create_labels(exp_names))
      .enter().append('text')
        .text(function(node){return node.label;})
        .attr('y', -3)
        .attr('x', function(node){return node.number * pwidth * tf})
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
  svg.selectAll('rect').transition().style('fill', function(n){
    return color(data[n.type][n.cell_line][n.protein][n.exp][n.tf]*1000);
  });
}

function transform_str_x(nodes){
  var x_transform = nodes[0].z * (w + margin) + margin;
  return 'translate(' + x_transform +')';
}

function transform_str_y(nodes){
  var y_transform = nodes[0].type * (pheight * height + margin) + margin;
  return 'translate(0, ' + y_transform + ')';
}

/********************************************************************************/
//DRAGGING//
function dragstart(d) {
  i = cell_lines_names.indexOf(d);
}

function drag(d) {
  x_scale.range()[i] = d3.event.x;
  cell_lines_names.sort(function(a, b) {return x_scale(a) - x_scale(b)});
  svg.selectAll(".cell-line").attr("transform", function(d) { return "translate(" + x_scale(d) + ")"; });
}

function dragend(d) {
  x_scale.domain(cell_lines_names).rangePoints([margin, total_width - margin + 1]);
  var t = d3.transition().duration(500);
  t.selectAll(".cell-line").attr("transform", function(d) {return "translate(" + x_scale(d) +")";});
}
/********************************************************************************/

