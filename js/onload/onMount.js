//função para definir a div inicial
const setInicio = () => {
    const inicio = d3.select('body').append('div').attr('id','inicio')
                     .classed('viewport', true)
                     .classed('centrado_absolute', true)

    const inicioTexto = inicio.append('div').attr('id','inicioTexto').classed('centrado_absolute', true)
    inicioTexto.append('h1').html('UFO SUSPICIOUS SIGHTS')
    inicioTexto.append('p').html('explore UFO sightings reported by people in a questionable state of existence (we think)')

    counterLimit = 60 * 2
    delayStarts = {
        bottom: 30,
        top: counterLimit - 60
    }
    setAnimatedUFO(d3.select(cenario), 200, false)
    animateRaioOVNI()


    /* botão que direciona */
    inicioTexto.append('button')
          .attr('id','toDOMforData')
          .html('EXPLORE NOW!')
          .on('click', (e) => {
            cancelAnimationFrame(animateRaioOVNI)
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
                                    cancelAnimationFrame(animateRaioOVNI)
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

