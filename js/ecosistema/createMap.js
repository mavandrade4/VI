let data1
const createMap = (template) => {
    clearDOM(container)
    
    data1 = TOPOJSON_COUNTRIES.features
            .map((d) => {
              const id = d.properties.ISO2
              const nomePais = d.properties.NAMEen
              const mostShapeGroup = d.properties.mostShapeGroup
              const shapeGroupsQuantidade = d.properties.shapeGroupsQuantidade
              const appears = d.properties.UFOAppears
              let duracoes = []
  
              for (const [key, value] of Object.entries(d.properties.duracoes)) {
                duracoes.push(
                  {menosDe: key, quantos: d.properties.duracoes[key].length}
                )
              }
  
  
              return {
                mostShapeGroup: mostShapeGroup,
                shapeGroupsQuantidade: shapeGroupsQuantidade,
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
    dorling = (selection) => {
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
              .on('focus', (e, d) => {
                paisDataAtual = d.shapeGroupsQuantidade
                    setDadosPaisForRadar()

                
                if(!mapaDataClick.classList.contains('show')){
                    d3.select(mapaDataClick).classed('show', true)
                    clearDOM(radarShapeData)
                    d3.select(radarShapeData).call(RadarChartSelection)
                    d3.select(paisMapa).text(d.nomePais)
                }
              })
              .on('blur', (e) => {
                d3.select(mapaDataClick).classed('show', false)
                const bounds = mapaDataClick.getBoundingClientRect()

                if(
                    posicaoRato.x > bounds.left && posicaoRato.x < bounds.right
                    &&
                    posicaoRato.y > bounds.top && posicaoRato.y < bounds.bottom
                ){
                    d3.select(mapaDataClick).classed('show', true)
                    e.currentTarget.focus()
                }
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

            node.filter(d => d.appears > 0)
                .append("image")
                .attr('xlink:href', d => `${getImageByShapeGroup(d.mostShapeGroup, 1)}`)
                .attr('width', d => radius(d.appears))
                .attr('x', d => -radius(d.appears)*0.5)
                .attr('y', d => -radius(d.appears)*0.5)
    
        simulation.on("tick", () => {
          node.attr("transform", d => `translate(${d.x}, ${d.y})`)
        });

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
              .attr('class', 'dorling')
              .call(dorling)
  
  
      container.append(test_svg.node())
  }