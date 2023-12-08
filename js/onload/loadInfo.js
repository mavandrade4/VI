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

    /*
      Cores relativas a cada porção do Pie Chart de cada país
      [segundos, minutos, horas, dias, trintaDias, anos]
    */
    const coresPie = ["#ff0000", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#000000"]

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
const loadInfo = (after) => {
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

      after(template)
    }
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
          }
        }
      )
    }
  )

}
// 2. Demeres Cartogram (quads)
//////////////////////////////////////////////////////
const createMap = (template) => {
  container.innerHTML = ''


  const size = d3.scalePow(
    [0, d3.max(TOPOJSON_COUNTRIES.features, (d) => d.properties.UFOAppears)],
    [7, k * 1.77]
  ).exponent(0.3)

  
  
  const data1 = TOPOJSON_COUNTRIES.features
          .map((d) => {
            const id = d.properties.ISO2;
            const appears = d.properties.UFOAppears
            let duracoes = []

            for (const [key, value] of Object.entries(d.properties.duracoes)) {
              duracoes.push(
                {menosDe: key, quantos: d.properties.duracoes[key].length}
              )
            }


            return {
              id,
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
            .on('mouseover', (e) => d3.select(e.currentTarget).classed('over', true))
            .on('mouseleave', (e) => d3.select(e.currentTarget).classed('over', false))
      
      node
          .append("circle")
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
          .attr("fill", (d, i) => coresPie[i])

      node.filter(d => d.appears === 0)
          .selectAll("path").remove()

      /* node.filter(d => d.appears === 0)
          .append("circle")
            .attr("r", (d) => radius(d.appears)) */
        

    
  
      const labels = selection
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
            .attr("class", (d) => (d.appears === 0) ? "nenhum" : null)
  
      simulation.on("tick", () => {
        node.attr("transform", d => `translate(${d.x}, ${d.y})`)
        labels.attr("x", (d) => d.x).attr("y", (d) => d.y);
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

addOnLoad(
  loadDadosTratados(
    () => {
      loadInfo(() => {
        createMap(template)
        doSlider()
      })
    }
  )
)