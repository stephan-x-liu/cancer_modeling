

var height = 6;
var width =78; // square root of number of nodes
var pheight = 20;
var pwidth = 4; //size of each node (pixel)
var margin = 30;
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
var Mdats = {};
var Ldats = {};
var Sdats = {};
var max = -10000;
var min = 10000;
var minlambda = 0.15
var maxlambda = 0.22
var lambdas = [
    0.15,0.1525,0.155,0.1575,
    0.16,0.1625,0.165,0.1675,
    0.17,0.1725,0.175,0.1775,
    0.18,0.1825,0.185,0.1875,
    0.19,0.1925,0.195,0.1975,
    0.2,0.2025,0.205,0.2075,
    0.21,0.2125,0.215,0.2175,
    0.22]


$(function(){
  $( "#slider" ).slider({
    value:1500,
    min: 1500,
    max: 2200,
    step: 25,
    slide: function( event, ui ) {
      $( "#lambda" ).val( ""+(ui.value/10000) );
      update_all(ui.value/10000);
    }
  });
  $( "#lambda" ).val( ""+ ($( "#slider" ).slider("value")/10000) );

  svg = svg_init();
  $.getJSON("http://www.stephanxliu.com/cancermodeling/0.15_M.json",function(data){
    console.log(data);
    Mdat = flatten(data);
    
    lambdas.forEach(function(l){
      $.getJSON("http://www.stephanxliu.com/cancermodeling/"+l.toString()+"_M.json",function(d){
        Mdats[l] = flatten(d);
      });
    });
    $.getJSON("http://www.stephanxliu.com/cancermodeling/0.15_L.json",function(data2){
      console.log(data2);
      Ldat = flatten(data2);
      lambdas.forEach(function(l){
        $.getJSON("http://www.stephanxliu.com/cancermodeling/"+l.toString()+"_L.json",function(d){
          Ldats[l] = flatten(d);
        });
      });
      $.getJSON("http://www.stephanxliu.com/cancermodeling/0.15_S.json",function(data3){
        console.log(data3);
        Sdat = flatten(data3);
        lambdas.forEach(function(l){
          $.getJSON("http://www.stephanxliu.com/cancermodeling/"+l.toString()+"_S.json",function(d){
            Sdats[l] = flatten(d);
          });
        });
        $.when(find_maxmin()).then(function(){
          color.domain([min*1000,(min+max)/2 * 1000, max*1000])
          M = draw_M(node_gen(Mdat),svg);
          S = draw_S(node_gen(Sdat),svg);
          L = draw_L(node_gen(Ldat),svg); 
          d3.select('body').append('div')
          .attr("align","center")
          .html("<pre> \
            p1: AKT pS473       exp1: mCh - DMSO\n \
            p2: AKT pT308       exp2: mCh - Lap\n \
            p3: pHER2           exp3: E545K - DMSO\n \
            p4: pHER3           exp4: E545K - Lap\n \
            p5: PDK1 pS241      exp5: H1047R - DMSO\n \
            p6: PI3K p85        exp6: H1047R - Lap</pre>");
        });
        
      });  
    });
  });
});

function find_maxmin(){
  lambdas.forEach(function(l){
    max = Math.max(max,Math.max.apply(null,Mdats[l]));
    min = Math.min(min,Math.min.apply(null,Mdats[l]));
    max = Math.max(max,Math.max.apply(null,Sdats[l]));
    min = Math.min(min,Math.min.apply(null,Sdats[l]));
    max = Math.max(max,Math.max.apply(null,Ldats[l]));
    min = Math.min(min,Math.min.apply(null,Ldats[l]));
  }); 
}

function flatten(json_dat){
  var temp = [];
  json_dat.forEach( function(json_arr){
    json_arr.forEach(function(dat){
      temp.push(dat);
    });
  });
  return temp;
}

function node_gen(data, exp, protein){
  var temp = [];
  for(var i = 0; i < height*width; i++){
    temp.push({
      x: i % width,
      y: Math.floor(i / width),
      value: (data[i]*1000)
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
      .attr('width', (margin*4)+(pwidth*width*3))
      .attr('height', 60+(pheight*height))
      .attr('preserveAspectRatio','xMidYMin')
      .style("border-radius","30px")
      .style("border","1px solid black")
      .style('display','block')
      .style('margin','auto');
  return svg;
}
function draw_M(nodes, svg){

  var M_nodes = svg.append('g').attr('class','nodes M').attr('transform', 'translate(' + margin +', 20)');   
  M_nodes
    .selectAll('rect')
    .data(nodes)
    .enter().append('rect')
      .attr('x', function(node){return node.x * pwidth;})
      .attr('y', function(node){return node.y * pheight;})
      .attr('width', pwidth)
      .attr('height', pheight)
      .style('fill', function(node){return color(node.value);})
  M_nodes.append('text').text('M').attr('x', w / 2 ).attr('y', h + 20).style('text-anchor', 'middle');
  M_nodes.append('text').text('p1').attr('x', -16).attr('y',pheight/2);
  M_nodes.append('text').text('p2').attr('x', -16).attr('y',3*pheight/2);
  M_nodes.append('text').text('p3').attr('x', -16).attr('y',5*pheight/2);
  M_nodes.append('text').text('p4').attr('x', -16).attr('y',7*pheight/2);
  M_nodes.append('text').text('p5').attr('x', -16).attr('y',9*pheight/2);
  M_nodes.append('text').text('p6').attr('x', -16).attr('y',11*pheight/2);
  M_nodes.append('text').text('exp1').attr('x', pwidth*13/2-20).attr('y',-8);
  M_nodes.append('text').text('exp2').attr('x', 3*pwidth*13/2-20).attr('y',-8);
  M_nodes.append('text').text('exp3').attr('x', 5*pwidth*13/2-20).attr('y',-8);
  M_nodes.append('text').text('exp4').attr('x', 7*pwidth*13/2-20).attr('y',-8);
  M_nodes.append('text').text('exp5').attr('x', 9*pwidth*13/2-20).attr('y',-8);
  M_nodes.append('text').text('exp6').attr('x', 11*pwidth*13/2-20).attr('y',-8);
  return M_nodes;
}

function draw_L(nodes, svg){
  var L_nodes = svg.append('g').attr('class','nodes L').attr('transform', 'translate(' + ((width * pwidth) + (2*margin)) +', 20)');   
  L_nodes
    .selectAll('rect')
    .data(nodes)
    .enter().append('rect')
      .attr('x', function(node){return node.x * pwidth;})
      .attr('y', function(node){return node.y * pheight;})
      .attr('width', pwidth)
      .attr('height', pheight)
      .style('fill', function(node){return color(node.value);})

  L_nodes.append('text').text('L').attr('x', w / 2 ).attr('y', h + 20).style('text-anchor', 'middle');
  L_nodes.append('text').text('p1').attr('x', -16).attr('y',pheight/2);
  L_nodes.append('text').text('p2').attr('x', -16).attr('y',3*pheight/2);
  L_nodes.append('text').text('p3').attr('x', -16).attr('y',5*pheight/2);
  L_nodes.append('text').text('p4').attr('x', -16).attr('y',7*pheight/2);
  L_nodes.append('text').text('p5').attr('x', -16).attr('y',9*pheight/2);
  L_nodes.append('text').text('p6').attr('x', -16).attr('y',11*pheight/2);
  L_nodes.append('text').text('exp1').attr('x', pwidth*13/2-20).attr('y',-8);
  L_nodes.append('text').text('exp2').attr('x', 3*pwidth*13/2-20).attr('y',-8);
  L_nodes.append('text').text('exp3').attr('x', 5*pwidth*13/2-20).attr('y',-8);
  L_nodes.append('text').text('exp4').attr('x', 7*pwidth*13/2-20).attr('y',-8);
  L_nodes.append('text').text('exp5').attr('x', 9*pwidth*13/2-20).attr('y',-8);
  L_nodes.append('text').text('exp6').attr('x', 11*pwidth*13/2-20).attr('y',-8);

  return L_nodes;
}

function draw_S(nodes, svg){   
  var S_nodes = svg.append('g').attr('class','nodes S').attr('transform', 'translate(' + (2*(width * pwidth) + (3*margin)) +', 20)');   
  S_nodes
    .selectAll('rect')
    .data(nodes)
    .enter().append('rect')
      .attr('x', function(node){return node.x * pwidth;})
      .attr('y', function(node){return node.y * pheight;})
      .attr('width', pwidth)
      .attr('height', pheight)
      .style('fill', function(node){return color(node.value);})

  S_nodes.append('text').text('S').attr('x', w / 2 ).attr('y', h + 20).style('text-anchor', 'middle');
  S_nodes.append('text').text('p1').attr('x', -16).attr('y',pheight/2);
  S_nodes.append('text').text('p2').attr('x', -16).attr('y',3*pheight/2);
  S_nodes.append('text').text('p3').attr('x', -16).attr('y',5*pheight/2);
  S_nodes.append('text').text('p4').attr('x', -16).attr('y',7*pheight/2);
  S_nodes.append('text').text('p5').attr('x', -16).attr('y',9*pheight/2);
  S_nodes.append('text').text('p6').attr('x', -16).attr('y',11*pheight/2);
  S_nodes.append('text').text('exp1').attr('x', pwidth*13/2-20).attr('y',-8);
  S_nodes.append('text').text('exp2').attr('x', 3*pwidth*13/2-20).attr('y',-8);
  S_nodes.append('text').text('exp3').attr('x', 5*pwidth*13/2-20).attr('y',-8);
  S_nodes.append('text').text('exp4').attr('x', 7*pwidth*13/2-20).attr('y',-8);
  S_nodes.append('text').text('exp5').attr('x', 9*pwidth*13/2-20).attr('y',-8);
  S_nodes.append('text').text('exp6').attr('x', 11*pwidth*13/2-20).attr('y',-8);
  return S_nodes;
}



function update(nodes,data){
  var i = -1;
  nodes.selectAll('rect').transition().style('fill', function(n){i++; return color(data[i]*1000);});
}

function update_all(lambda){
  update(M,Mdats[lambda]);
  update(L,Ldats[lambda]);
  update(S,Sdats[lambda]);
}



