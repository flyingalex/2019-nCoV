
var width  = 1024;
var height = 768;

var svg = d3.select("#china-map").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(0,0)");

var projection = d3.geoMercator()
    .center([107, 31])
    .scale(700)
    .translate([width/2, height/2]);

var path = d3.geoPath()
    .projection(projection);

//var color = d3.scale.category10();
d3.json("https://gist.githubusercontent.com/flyingalex/4622d0f6e9a888cd5640c4dce943697b/raw/ab5167746f6c1ac7c38d7d4651783c26d2dd8987/china_full.json").then((root) => {
  //添加提示
  var tooltip = d3.select("body")
  .append("div")
  .attr("class","tooltip")
  .style("opacity", 0);

  //绘制地图
  svg.selectAll("path")
    .data(root.features)
    .enter()
    .append("path")
    .attr("stroke","#000")
    .attr("stroke-width",1)
    .attr("fill", function(d,i){
      return "gray";
    })
    .attr("d", path )
    .on("mouseover",function(d,i){
      d3.select(this).attr("fill","#E9A825");
      tooltip.transition()
        .duration(200)
        .style("opacity", .9);

      tooltip.html(d.properties.name)
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
    })
    .on("mouseout",function(d,i){
      d3.select(this).attr("fill","gray");
      tooltip.transition()
             .duration(500)
             .style("opacity", 0);
    });
});
