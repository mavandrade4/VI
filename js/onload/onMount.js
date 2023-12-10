//função para definir a div inicial
const setInicio = () => {
    const inicio = d3.select('body').append('div').attr('id','inicio')
                     .classed('viewport', true)
                     .classed('centrado_absolute', true)

    const inicioTexto = inicio.append('div').attr('id','inicioTexto').classed('centrado_absolute', true)
    inicioTexto.append('h1').html('UFO SUSPICIOUS SIGHTS')
    inicioTexto.append('p').html('explore UFO sightings reported by people in a questionable state of existence (we think)')

    inicioTexto.append('button')
          .attr('id','toDOMforData')
          .html('EXPLORE NOW!')
          .on('click', (e) => {
            //dar clear ao body
            clearDOM(document.body)

            //adicionar os DOMs respetivos para aparecerem data (#container e o #sliderAnos)
            setDOMforData()

            d3.select('body').call(createMapaDataInfo)
            loadDadosTratados(loadingFun.add)
                .then(
                    () => loadInfo(() => {})
                            .then(
                                () =>{
                                    createMap(template)
                                    doSlider()
                                    loadingFun.remove()
                                }
                            )
                )
          })
}

addOnLoad(setInicio)