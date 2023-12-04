const doSlider = () => {
    sliderAnos.min = ano.min
    sliderAnos.max = ano.max
    sliderAnos.value = ano.atual

    sliderAnos.onchange = () => {
        const sl_value = parseInt(sliderAnos.value)
        if(todosAnos.includes(sl_value)){
            ano.atual = sl_value
            setDadosAtuais()
            setAppears()
            createMap(template)
        }
    }
}