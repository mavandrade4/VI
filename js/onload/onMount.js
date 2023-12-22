//função para definir a div inicial
let animationRaioOVNI_ID

const setInicio = () => {
    const inicio = d3.select('body').append('div').attr('id','inicio')
                     .classed('viewport', true)
                     .classed('centrado_absolute', true)

    const inicioTexto = inicio.append('div').attr('id','inicioTexto').classed('centrado_absolute', true)
    const inicioH1 = inicioTexto.append('div').classed('inicioHeading', true)
    inicioH1.append('h1').html('UFO')
    inicioH1.append('h1').html('UFO')
    const inicioH2 = inicioTexto.append('div').classed('inicioHeading', true)
    inicioH2.append('h2').html('SUSPICIOUS SIGHTS')
    inicioH2.append('h2').html('SUSPICIOUS SIGHTS')
    inicioTexto.append('p').html('explore UFO sightings reported by people<br>in a questionable state of existence <em>we think</em>')

    counterLimit = 60 * 2
    delayStarts = {
        bottom: 30,
        top: counterLimit - 60
    }
    setAnimatedUFO(d3.select(cenario), 200, false, true)
    svgPolygonDimensions = [1000, 5000]
    animateRaioOVNI()


    /* botão que direciona */
    inicioTexto.append('button')
          .attr('id','toDOMforData')
          .html('EXPLORE NOW!')
          .on('click', (e) => {
            cancelAnimationFrame(animationRaioOVNI_ID)
            //dar clear ao body
            clearDOM(document.body)
            cenario.querySelector('div').remove()
            document.querySelector('.UFO').remove()

            //adicionar os DOMs respetivos para aparecerem data (#container e o #sliderAnos)
            setDOMforData()

            d3.select('body').call(createMapaDataInfo)
            d3.select('body').call(createMapaDataClick)
            loadDadosTratados(loadingFun.add)
                .then(
                    () => loadInfo(() => {})
                            .then(
                                () =>{
                                    createMap(template)
                                    doSlider()
                                    d3.select(document.body).append('img').attr('id', 'iconHoverShapeData').attr('alt', '').attr('src', getImageByShapeGroup('other'))
                                    setTimeout(() => loadingFun.remove(), 2000)
                                }
                            )
                )
          })
}

addOnLoad(setInicio)

