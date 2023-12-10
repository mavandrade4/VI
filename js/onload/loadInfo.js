/* svg do mapa */
let test_svg 

/* tamanho máximo de cada quadrado */
let k = 50

//objeto de países obtidos através de um topojson (isto advém de um código na web, mais info embaixo)
let TOPOJSON_COUNTRIES

    //constantes precisas no código
    const sphere = ({ type: "Sphere" })

    const width = 1920 * 0.5
    const height = 1080 * 0.5

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

    let template

/*
  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  ================================================================
  feito sobre o código de https://observablehq.com/@neocartocnrs/dorling-vs-demers
  (porção sobre a cartografia de Dorling)
          (com mudanças)
  ================================================================
  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/

/* função para carregar as informações */
const loadInfo = async (onStart) => {
  onStart()

  return (
    d3.json(
      "https://raw.githubusercontent.com/neocarto/resources/master/geometries/World/world_countries.topojson"
    )
    .then(
      (world) => {
              // 1. Data import & handling
              ///////////////////////////////////////////////////////
        TOPOJSON_COUNTRIES = topojson.feature(world, world.objects.world_countries_data)

                  setNewData()
        
        /* template do mapa (servirá só para debugs) */
        template = (selection) => {
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

      }
    )
  )
}

/* 
  função que coloca o atributo UFOAppears e duracoes (durações de cada aparecimento nesse país)
  (total de aparecimentos por país)
  para os objetos em TOPOJSON_COUNTRIES.features
*/
const setNewData = () => {
  TOPOJSON_COUNTRIES.features.forEach(
    (pais, index) => {
      TOPOJSON_COUNTRIES.features[index].properties.UFOAppears = 0
      TOPOJSON_COUNTRIES.features[index].properties.duracoes = {
        segundos: [],
        minutos: [],
        horas: [],
        dias: [],
        trintaDias: [],
        anos: []
      }
      TOPOJSON_COUNTRIES.features[index].properties.shapeGroups = []
      TOPOJSON_COUNTRIES.features[index].properties.mostShapeGroup = ''
    }
  )

  const paisesNome = TOPOJSON_COUNTRIES.features.map(
    (pais) => pais.properties.NAMEen
  )
  
  dadosAtuais.objetos.forEach(
    (obj) => {
      paisesNome.forEach(
        (paisnome, index) => {
          if(obj.country === paisnome){
            TOPOJSON_COUNTRIES.features[index].properties.UFOAppears += 1

            const duracao = parseFloat(obj["duration (seconds)"])
            TOPOJSON_COUNTRIES.features[index].properties.duracoes[
              (duracao < 60) ? "segundos" :
              (duracao < 60 * 60) ? "minutos" :
              (duracao < 60 * 60 * 24) ? "horas" :
              (duracao < 60 * 60 * 24 * 30) ? "dias" :
              (duracao < 60 * 60 * 24 * 30 * 12) ? "trintaDias" :
              "anos"
            ].push(duracao)

            TOPOJSON_COUNTRIES.features[index].properties.shapeGroups.push(obj["shape group"])
          }
        }
      )
    }
  )

  TOPOJSON_COUNTRIES.features.forEach(
    paisInfo => paisInfo.properties.mostShapeGroup = moda(paisInfo.properties.shapeGroups)
  )

}
// 2. Demeres Cartogram (quads)
//////////////////////////////////////////////////////
const createMap = (template) => {
  clearDOM(container)


  const size = d3.scalePow(
    [0, d3.max(TOPOJSON_COUNTRIES.features, (d) => d.properties.UFOAppears)],
    [7, k * 1.77]
  ).exponent(0.3)

  
  
  const data1 = TOPOJSON_COUNTRIES.features
          .map((d) => {
            const id = d.properties.ISO2
            const nomePais = d.properties.NAMEen
            const mostShapeGroup = d.properties.mostShapeGroup
            const appears = d.properties.UFOAppears
            let duracoes = []

            for (const [key, value] of Object.entries(d.properties.duracoes)) {
              duracoes.push(
                {menosDe: key, quantos: d.properties.duracoes[key].length}
              )
            }


            return {
              mostShapeGroup: mostShapeGroup,
              nomePais: nomePais,
              id: id,
              coords: Poly2Center(d),
              appears: appears,
              duracoes: duracoes
            };
          })
          .filter((d) => d.appears != null)
          

  
  const radius = d3.scalePow([0, d3.max(data1, (d) => d.appears)], [5, k]).exponent(0.3)


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


  const graficoTorta = d3.pie().value(d => d.quantos)
  demers = (selection) => {
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
                            d3.forceCollide((d) => radius(d.appears))
                          );
  
    
      const arc = d3.arc().innerRadius(0).outerRadius(radius(50))
      let foo = d3.local()
      const node = selection.append("g")
          .attr("class", "piecharts")
          .attr("stroke", "#fff")
          .attr("stroke-width", 0.5)
          .selectAll("g")
          .data(data1)
          .enter()
          .append("g")
            .attr("transform", d => `translate(${d.x}, ${d.y})`)
            .attr("name", (d) => d.id)
            .attr("class", (d) => (d.appears === 0) ? "nenhum" : null)

          node.filter(d => d.appears > 0)
            .on('mouseover', (e, d) => {
              d3.select(e.currentTarget).classed('over', true)

              const infoPais = d3.select(mapaDataInfo)
                                 .classed('show', true)

              infoPais.select('h4')
                      .html(`${d.nomePais} | ${d.id}`)


              infoPais.selectAll('li')
                .data(graficoTorta(d.duracoes))
                .html(data => `${data.value} (${Math.round(1000 * (data.endAngle - data.startAngle) / (2 * Math.PI)) / 10}%)`)
              
              infoPais.select("#msshape").html(d.mostShapeGroup)
            })
            .on('mouseleave', (e) => {
              d3.select(e.currentTarget).classed('over', false)
              d3.select(mapaDataInfo).classed('show', false)
            })
            .on('mousemove', (e) => {
              d3.select(mapaDataInfo)
                .attr("style",
                      `top: ${(e.clientY < window.innerHeight*0.5) ? (e.clientY + 20) : (e.clientY - 20 - mapaDataInfo.clientHeight)}px;
                      left:${(e.clientX < window.innerWidth*0.5) ? (e.clientX + 20) : (e.clientX - 20 - mapaDataInfo.clientWidth)}px;`)
            })
      
      node.append("circle")
          .attr("r", (d) => radius(d.appears))
          
      let k = 0;
      let indexes = 0;
      node.selectAll("path")
        .data(d => graficoTorta(d.duracoes))
        .enter()
        .append("path")
        .attr("d", d => {
            if(k % 6 === 0 && k !== 0) indexes++;
            k++;
            const arco = d3.arc().innerRadius(0).outerRadius(radius(data1[indexes].appears))
            return arco(d)
          })
          .attr("class", (d, i) => classPie[i])

      node.filter(d => d.appears === 0)
          .selectAll("path").remove()
      
      /* node.append("text").text(d => d.mostShapeGroup) */
      node.append("image")
          .attr('xlink:href', d => `./shapes/${getImageByShapeGroup(d.mostShapeGroup, 1)}`)
          .attr('width', d => radius(d.appears))
          .attr('x', d => -radius(d.appears)*0.5)
          .attr('y', d => -radius(d.appears)*0.5)

      /* node.filter(d => d.appears === 0)
          .append("circle")
            .attr("r", (d) => radius(d.appears)) */
        

    
  
      /* const labels = selection
        .append("g")
        .attr("class", "labels")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill-opacity", 0.6)
        .selectAll("text")
        .data(data1)
        .join("text")
            .attr("name", (d) => d.id)
        .text((d) => d.id)
        .attr("font-family", function (d, i) {
          return i < 5 ? "serif" : "sans-serif";
        })
        .attr("fill", "white")
        .style("font-size", (d) => `${radius(d.appears) * 0.55}px`)
        .attr("alignment-baseline", "central")
            .attr("class", (d) => (d.appears === 0) ? "nenhum" : null) */
  
      simulation.on("tick", () => {
        node.attr("transform", d => `translate(${d.x}, ${d.y})`)
        /* labels.attr("x", (d) => d.x).attr("y", (d) => d.y); */
      });
  
    /* invalidation.then(() => simulation.stop()); */
  }


  
  test_svg = d3
    .create("svg")
    .attr("id", "mapa")
    .attr("class","centrado_absolute")
    .attr("viewBox", [0, 0, width, height])

  const grupalhada = test_svg.append('g')
    
  
  /* grupalhada.append('g')
            .attr('class', 'templateMapa')
            .call(template) */

  grupalhada.append('g')
            .attr('class', 'demers')
            .call(demers)


    container.append(test_svg.node())
}