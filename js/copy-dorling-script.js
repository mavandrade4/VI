let k = 60
let svg

window.onload = function(){
    const data = d3.csv("data/UFO_sights.csv")


    /*
      ================================================================
      copy do https://observablehq.com/@neocartocnrs/dorling-vs-demers
      ================================================================
    */

                // 1. Data import & handling
                ///////////////////////////////////////////////////////

    const world = d3.json(
      "https://raw.githubusercontent.com/neocarto/resources/master/geometries/World/world_countries.topojson"
    )
      .then(
        (world) => {
          const countries = topojson.feature(world, world.objects.world_countries_data)

          const sphere = ({ type: "Sphere" })

          const width = 853
          const height = 480

          const projection = d3.geoNaturalEarth2()
      
          const path = d3.geoPath(projection)
      
          const Poly2Center = function(d) {
            if (d.geometry.type == "MultiPolygon") {
              var best = {};
              var bestArea = 0;
              d.geometry.coordinates.forEach(function(coords) {
                var poly = { type: 'Polygon', coordinates: coords };
                var area = d3.geoArea(poly);
                if (area > bestArea) {
                  bestArea = area;
                  best = poly;
                }
              });
              return path.centroid(best);
            } else {
              return path.centroid(d);
            }
          }
      
          
      
          const template = (selection) => {
            selection
              .append("g")
              .append("path")
              .datum(sphere)
              .attr("class", "graticuleOutline")
              .attr("d", path)
              .style("fill", "#9ACBE3");
          
            selection
              .append("g")
              .append("path")
              .datum(d3.geoGraticule10())
              .attr("class", "graticule")
              .attr("d", path)
              .attr("clip-path", "url(#clip)")
              .style("fill", "none")
              .style("stroke", "white")
              .style("stroke-width", 0.8)
              .style("stroke-opacity", 0.5)
              .style("stroke-dasharray", 2);
          
            selection
              .append("path")
              .datum(countries)
              .attr("fill", "#e0daa2")
              .attr("stroke", "#737270")
              .attr("stroke-width", 0.1)
              .attr("d", path);
          }
      
                      // 2. Dorling Cartogram (circles)
                      ///////////////////////////////////////////////////////
          
          const data1 = countries.features
          .map((d) => {
            const id = d.properties.ISO2;
            const pop = d.properties.PopTotal;
            return {
              id,
              pop,
              coords: Poly2Center(d)
            };
          })
          .filter((d) => d.pop != null)
      
      
          const radius = d3.scaleSqrt([0, d3.max(data1, (d) => d.pop)], [0, k])
      
          const dorling = (selection) => {
      
            const simulation = d3.forceSimulation(data1)
                                 .force(
                                   "x",
                                   d3.forceX((d) => d.coords[0])
                                 )
                                 .force(
                                   "y",
                                   d3.forceY((d) => d.coords[1])
                                 )
                                 .force(
                                   "collide",
                                   d3.forceCollide((d) => radius(d.pop))
                                 );
            //  .stop()
          
            const node = selection.append("g")
                                  .attr("fill", "#e04a28")
                                  .attr("fill-opacity", 0.9)
                                  .attr("stroke", "#fff")
                                  .attr("stroke-width", 0.5)
                                  .selectAll("circle")
                                  .data(data1)
                                  .join("circle")
                                  .attr("cx", (d) => d.x)
                                  .attr("cy", (d) => d.y)
                                  .attr("r", (d) => radius(d.pop));
                              
                                const labels = selection
                                  .append("g")
                                  .attr("text-anchor", "middle")
                                  .attr("dominant-baseline", "middle")
                                  .attr("fill-opacity", 0.6)
                                  .selectAll("text")
                                  .data(data1)
                                  .join("text")
                                  .text((d) => d.id)
                                  .attr("font-family", function (d, i) {
                                    return i < 5 ? "serif" : "sans-serif";
                                  })
                                  .attr("fill", "white")
                                  .style("font-size", (d) => `${radius(d.pop) * 0.9}px`)
                                  .attr("alignment-baseline", "central");
                              
                                simulation.on("tick", () => {
                                  node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
                                  labels.attr("x", (d) => d.x).attr("y", (d) => d.y);
                                });
                              
                                /* invalidation.then(() => simulation.stop()); */
          }
      
      
      
      
      
      
      
      
      
      
          svg = d3
            .create("svg")
            .attr("viewBox", [0, 0, width, height])
            .style("width", "100%")
            .style("height", "auto");
      
            svg.call(template)
            svg.call(dorling)
      
          console.log(svg)
        }
      )

    
}