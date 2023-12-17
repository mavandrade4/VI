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
  
  (continuação em ../ecosistema/createMap.js)
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
      TOPOJSON_COUNTRIES.features[index].properties.shapeGroupsQuantidade = []
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
    paisInfo => {
      paisInfo.properties.shapeGroupsQuantidade = contador(paisInfo.properties.shapeGroups)
      paisInfo.properties.mostShapeGroup = moda(paisInfo.properties.shapeGroups)
    }
  )

}