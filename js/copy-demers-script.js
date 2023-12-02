let demers_svg

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

          const width = 1920
          const height = 1080

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
          const size = d3.scaleSqrt(
            [0, d3.max(countries.features, (d) => d.properties.PopTotal)],
            [0, k * 1.77]
          )
          
          const data2 = countries.features
          .map((d) => {
            const id = d.properties.ISO2;
            const pop = d.properties.PopTotal;
            const height = size(d.properties.PopTotal);
            const width = size(d.properties.PopTotal);
            const coords = Poly2Center(d);
            return {
              id,
              pop,
              height,
              width,
              x: coords[0],
              y: coords[1]
            };
          })
          .filter((d) => d.pop != null)
      
      
          

          const padding = 0.2

          function forceCollide() {
            let nodes;
          
            function force(alpha) {
              const quad = d3.quadtree(
                nodes,
                (d) => d.x,
                (d) => d.y
              );
              for (const d of nodes) {
                quad.visit((q, x1, y1, x2, y2) => {
                  let updated = false;
                  if (q.data && q.data !== d) {
                    let x = d.x - q.data.x,
                      y = d.y - q.data.y,
                      xSpacing = padding + (q.data.width + d.width) / 2,
                      ySpacing = padding + (q.data.height + d.height) / 2,
                      absX = Math.abs(x),
                      absY = Math.abs(y),
                      l,
                      lx,
                      ly;
          
                    if (absX < xSpacing && absY < ySpacing) {
                      l = Math.sqrt(x * x + y * y);
          
                      lx = (absX - xSpacing) / l;
                      ly = (absY - ySpacing) / l;
          
                      // the one that's barely within the bounds probably triggered the collision
                      if (Math.abs(lx) > Math.abs(ly)) {
                        lx = 0;
                      } else {
                        ly = 0;
                      }
                      d.x -= x *= lx;
                      d.y -= y *= ly;
                      q.data.x += x;
                      q.data.y += y;
          
                      updated = true;
                    }
                  }
                  return updated;
                });
              }
            }
          
            force.initialize = (_) => (nodes = _);
          
            return force;
          }

          demers = (selection) => {
            //const nodes = data2;
          
            const simulation = d3
              .forceSimulation(data2)
              .force(
                "x",
                d3.forceX((d) => d.x)
              )
              .force(
                "y",
                d3.forceY((d) => d.y)
              )
              //.force("manyBody", d3.forceManyBody().strength(10))
              .force("collide", forceCollide());
          
            const node = selection
              .append("g")
              .attr("fill", "#e04a28")
              .attr("fill-opacity", 0.9)
              .attr("stroke", "#fff")
              .attr("stroke-width", 0.5)
              .selectAll("rect")
              .data(data2)
              .join("rect")
              .attr("x", (d) => d.x - d.width / 2)
              .attr("y", (d) => d.y - d.height / 2)
              .attr("width", (d) => d.width)
              .attr("height", (d) => d.height);
          
            const labels = selection
              .append("g")
              .attr("text-anchor", "middle")
              .attr("dominant-baseline", "middle")
              .attr("fill-opacity", 0.6)
              .selectAll("text")
              .data(data2)
              .join("text")
              .text((d) => d.id)
              .attr("font-family", function (d, i) {
                return i < 5 ? "serif" : "sans-serif";
              })
              .attr("fill", "white")
              .style("font-size", (d) => `${size(d.pop) * 0.55}px`)
              .attr("alignment-baseline", "central");
          
            simulation.on("tick", () => {
              node
                .attr("x", (d) => d.x - d.width / 2)
                .attr("y", (d) => d.y - d.height / 2);
              labels.attr("x", (d) => d.x).attr("y", (d) => d.y);
            });
          
            /* invalidation.then(() => simulation.stop()); */
          }
      
      
      
      
      
      
      
      
      
      
          demers_svg = d3
            .create("svg")
            .attr("viewBox", [0, 0, width, height])
            .style("width", "100%")
            .style("height", "auto");
      
            demers_svg.call(template)
            demers_svg.call(demers)
        }
      )

    
}