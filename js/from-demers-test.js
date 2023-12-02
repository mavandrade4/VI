let test_svg
const corQuads = "#000000"

// ufo_data / dataTotal
let dataTotal = undefined
/*
  ==== dateTimeObject: objeto de data, tem/terá, vários parâmetros
  {
    datetime:       [string] (data no formato do CSV: mm/dd/yy hh:minmin)
      data:         [string] (data no formato mm/dd/yyyy)
      horario:      [string] (hórario em hh:minmin)
        dia:        [number] (dd / d)
        mes:        [number] (mm / m)
        ano:        [number] (yyyy)
        hora:       [number] (hh / h)
        minutos:    [number] (minmin / min)
  }
*/
let dateTimeObject = undefined

// array de todos os anos do CSV (em cada index)
let todosAnos = []
// objeto "Ano" que contém o ano minimo, maximo do CSV e o "atual selecionado" (contido no CSV)
let ano = {}

/*
   ==== dadosAtuais: objeto que contem os dados atuais (do intervalo / ano escolhido)
  e os indices associados a esses anos
  {
    indexes:      [number array] (contém os indíces referentes ao CSV original)
    anos:         [number array] (anos, só para debug)
  }
*/
let dadosAtuais = {
  indexes: [],
  anos: []
}


//objeto de países obtidos através de um topojson (isto advém de um código na web, mais info embaixo)
let TOPOJSON_COUNTRIES

window.onload = function(){
    

    d3.csv("../data/dados_tratados.csv")
      .then((ufo_data) => {
        dataTotal = ufo_data

        const datetime = ufo_data.map((d) => d.datetime)

        dateTimeObject = datetime.map(
          (dt) => funcoesDateTime.objeto(dt)
        )

        todosAnos = dateTimeObject.map((dtObj) => dtObj.ano)
        ano = {
          min: Math.min(...todosAnos),
          max: Math.max(...todosAnos),
          atual: todosAnos[parseInt(Math.random() * todosAnos.length)]
        }

        console.log(ano)

        setDadosAtuais()



        



        /*
          ================================================================
          feito sobre o código de https://observablehq.com/@neocartocnrs/dorling-vs-demers
          (porção sobre a cartografia de Demeres)
          ================================================================
        */

        d3.json(
          "https://raw.githubusercontent.com/neocarto/resources/master/geometries/World/world_countries.topojson"
        )
          .then(
            (world) => {
                    // 1. Data import & handling
                    ///////////////////////////////////////////////////////
              TOPOJSON_COUNTRIES = topojson.feature(world, world.objects.world_countries_data)

                        TOPOJSON_COUNTRIES.features.forEach(
                          (pais, index) => TOPOJSON_COUNTRIES.features[index].properties.UFOAppears = 0
                        )

                        const paisesNome = TOPOJSON_COUNTRIES.features.map(
                          (pais) => pais.properties.NAMEen
                        )
                        console.log(paisesNome)
                        
                        dadosAtuais.objetos.forEach(
                          (obj) => {
                            paisesNome.forEach(
                              (paisnome, index) => {
                                if(obj.country === paisnome){
                                  TOPOJSON_COUNTRIES.features[index].properties.UFOAppears += 1
                                }
                              }
                            )
                          }
                        )
                       




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
          
              
              
              /* template do mapa (servirá só para debugs) */
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
                  .datum(TOPOJSON_COUNTRIES)
                  .attr("fill", "#e0daa2")
                  .attr("stroke", "#737270")
                  .attr("stroke-width", 0.1)
                  .attr("d", path);
              }
          
                          // 2. Dorling Cartogram (circles)
                          ///////////////////////////////////////////////////////
              const size = d3.scalePow(
                [0, d3.max(TOPOJSON_COUNTRIES.features, (d) => d.properties.UFOAppears)],
                [0, k * 1.77]
              ).exponent(0.3)
              
              const data2 = TOPOJSON_COUNTRIES.features
              .map((d) => {
                const id = d.properties.ISO2;
                const pop = d.properties.UFOAppears;
                const height = size(d.properties.UFOAppears);
                const width = size(d.properties.UFOAppears);
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
                  .attr("fill", corQuads)
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
          
          
          
          
          
          
          
          
          
          
              test_svg = d3
                .create("svg")
                .attr("viewBox", [0, 0, width, height])
                
          
                test_svg.call(template)
                test_svg.call(demers)

                container.append(test_svg.node())
            }
          )

      }
    )
    
}