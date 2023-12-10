/* ====================
    settar as qualidades do slider de tempo
*/
const doSlider = () => {
    sliderAnos.min = ano.min
    sliderAnos.max = ano.max
    sliderAnos.value = ano.atual
    setSliderPath()

    sliderAnos.oninput = () => setSliderPath()

    sliderAnos.onchange = () => {
        const sl_value = parseInt(sliderAnos.value)
        if(todosAnos.includes(sl_value)){
            ano.atual = sl_value
            setDadosAtuais()
            setNewData()
            createMap(template)
        }
    }
}

const setSliderPath = () => {
    const percentagemInicial = Math.round(1000 * ((sliderAnos.value - sliderAnos.min) / (sliderAnos.max - sliderAnos.min))) / 10
    sliderAnos.style.background = `linear-gradient(90deg, rgba(166, 250, 60, 0.3) ${percentagemInicial}%,transparent ${percentagemInicial}%)`
}