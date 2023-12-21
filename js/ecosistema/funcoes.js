



////////////////////////////////////////////////////////////////////////////////////////////
// objeto com listagem de funções utilizadas para obter um certo dado de um datetime (proveniente do .csv)
const funcoesDateTime = {
    data: (datetime) => {
        const indexOf_espaco = datetime.indexOf(' ')
        return datetime.substring(0, indexOf_espaco)
    },
    horario: (datetime) => {
        const indexOf_espaco = datetime.indexOf(' ')
        return datetime.substring(indexOf_espaco + 1, datetime.length)
    },


    dia: (datetime) => {
        const data = funcoesDateTime.data(datetime)
        return parseInt(data.substring(data.indexOf('/') + 1, data.lastIndexOf('/')))
    },
    mes: (datetime) => {
        const data = funcoesDateTime.data(datetime)
        return parseInt(data.substring(0, data.indexOf('/')))
    },
    ano: (datetime) => {
        const data = funcoesDateTime.data(datetime)
        return parseInt(data.substring(data.lastIndexOf('/') + 1, data.length))
    },


    hora: (datetime) => {
        const horario = funcoesDateTime.horario(datetime)
        return parseInt(horario.substring(0, horario.indexOf(':')))
    },
    minutos: (datetime) => {
        const horario = funcoesDateTime.horario(datetime)
        return parseInt(horario.substring(horario.indexOf(':') + 1, horario.length))
    },

    objeto: (datetime) => {
        return {
            datetime: datetime,
                data: funcoesDateTime.data(datetime),
                horario: funcoesDateTime.horario(datetime),
                dia: funcoesDateTime.dia(datetime),
                mes: funcoesDateTime.mes(datetime),
                ano: funcoesDateTime.ano(datetime),
                hora: funcoesDateTime.hora(datetime),
                minutos: funcoesDateTime.minutos(datetime)
            }
        }
}

////////////////////////////////////////////////////////////////////////////////////////////
// função executada no load da window
const addOnLoad = (fun) => window.addEventListener('load', fun)

////////////////////////////////////////////////////////////////////////////////////////////
// contador de um array
const contador = array => 
    Object.values(
    array.reduce((count, elemento) => {
        if (!(elemento in count)) {
        count[elemento] = [0, elemento];
        }
        
        count[elemento][0]++;
        return count;
    }, {})
    )
////////////////////////////////////////////////////////////////////////////////////////////
// moda de um array
const moda = array => 
    contador(array).reduce((array, value) => value[0] < array[0] ? array : value, [0, null])[1]


////////////////////////////////////////////////////////////////////////////////////////////
// Todas as shapeGroups disponiveis
const allShapeGroups = [
    'other',
    'V shape',
    'cylinder',
    'round',
    'cone',
    'crescent',
    'cross',
    'triangle',
    'diamond',
    'ellipse',
    'oval',
    'circle of light',
    'formation',
    'hexagon',
    'pyramid',
    'rectangle',
    'teardrop'
]

const allReturnImageShapeGroup = [
    'unk',
    'v',
    'cyl',
    'oval',
    'cone',
    'Cresc',
    'Cross',
    'tria',
    'dimon',
    'oval',
    'oval',
    'circ',
    'formation',
    'Hex',
    'pyra',
    'rect',
    'tear'
]


////////////////////////////////////////////////////////////////////////////////////////////
// filtragem da shapegroup para imagem (a imagem associada)
const getImageByShapeGroup = (shapeGroup, version) => {
    let string = ''

    allShapeGroups.forEach(
        (sg, index) => {
            if(shapeGroup === sg){
                string = allReturnImageShapeGroup[index]
                return
            }
        }
    )

    return './imgs/shapes/Shape_' + string + ((version === 2) ? version : '') + '.svg'
}

/*
    Classes relativas a cada porção do Pie Chart de cada país
    [segundos, minutos, horas, dias, trintaDias, anos]
*/
const classPie = ["segundos", "minutos", "horas", "dias", "trintaDias", "anos"]

////////////////////////////////////////////////////////////////////////////////////////////
// div #mapaDataInfo (informa ao dar hover)
const createMapaDataInfo = (selection) => {
    const mapaDataInfo = selection.append('div').attr('id', 'mapaDataInfo')

    mapaDataInfo.append('h4')
    mapaDataInfo.append('h5').style('margin-bottom', '4px')

    mapaDataInfo.append('ul')
                .selectAll('li')
                .data(classPie).enter()
                .append('li')
                    .attr('class', d => d)

    mapaDataInfo.append('h5').attr('id', 'msshape')
}

////////////////////////////////////////////////////////////////////////////////////////////
// div #mapaDataClick (informa ao dar click)
const createMapaDataClick = (selection) => {
    const mapaDataClick = selection.append('div').attr('id', 'mapaDataClick')
    
    mapaDataClick.append('h2').text('Most Seen Shapes')
    mapaDataClick.append('h3').attr('id', 'paisMapa')
    mapaDataClick.append('div').attr('id', 'radarShapeData')
    mapaDataClick.append('h4').text('Filters')


    const formRadarFiltragem = mapaDataClick.append('form').attr('id', 'radarFiltragemForm')
                                    .on('submit', (e) => {
                                        e.preventDefault();
                                        const target = e.currentTarget
                                        console.log('submited')

                                        const checkedCheckboxes = target.querySelectorAll('input[type="checkbox"]:checked')
                                        const nowClicked = target.querySelector('.nowClicked')

                                        if(checkedCheckboxes.length >= 3){
                                            nowClicked.classList.remove('nowClicked')

                                            let notCheckedNames = []
                                            allShapeGroups.forEach(
                                                shapeGroup => {
                                                    let isChecked = false
                                                    for(let i = 0; i < checkedCheckboxes.length; i++){
                                                        if(shapeGroup === checkedCheckboxes[i].name){
                                                            isChecked = true
                                                            break
                                                        }
                                                    }
                                                    if(!isChecked) notCheckedNames.push(shapeGroup)
                                                }
                                            )

                                            filtrosRadar = allShapeGroups
                                            filtrosRadar = filtrosRadar.filter(x => {
                                                if(!notCheckedNames.includes(x)) return x
                                            })
                                            setDadosPaisForRadar()
                                            clearDOM(radarShapeData)
                                            d3.select(radarShapeData).call(RadarChartSelection)
                                        }
                                        else{
                                            nowClicked.classList.remove('nowClicked')
                                            nowClicked.classList.add('naoRemover')
                                            const timeout = setTimeout(
                                                () => {
                                                    nowClicked.classList.remove('naoRemover')
                                                    return clearTimeout(timeout)
                                                }, 200
                                            )
                                            d3.select(nowClicked).property('checked', true)
                                        }
                                    })


    formRadarFiltragem.append('button').attr('id', 'submitBtn').style('display', 'none')

    const inputs = formRadarFiltragem.selectAll('label')
                    .data(allShapeGroups).enter()
                    .append("lable").text(d => d)
                    .append('input').attr('type', 'checkbox').attr('name', d => d).property('checked', true)
                    .on('input', (e) => {
                        e.currentTarget.classList.add('nowClicked')
                        submitBtn.click();
                    })
}

////////////////////////////////////////////////////////////////////////////////////////////
// dar clear a um DOM
const clearDOM = (selection) => selection.innerHTML = ''

////////////////////////////////////////////////////////////////////////////////////////////
// div #container (adicionado pós incialização "da app")
const setDOMforData = () => {
    d3.select('body').append('div').attr('id','container')
    
    const divSlider = d3.select('body').append('div').attr('id','divSlider')
    divSlider.append('ol').attr('id', 'labelAnos')
    divSlider.append('input').attr('type', 'range').attr('id', 'sliderAnos')
}

////////////////////////////////////////////////////////////////////////////////////////////
// div #loadingScreen
const loadingFun = {
    add: () => {
        const LS = d3.select('body').append('div').attr('id','loadingScreen')
                        .classed('viewport', true).classed('centrado_absolute', true)


        counterLimit = 45
        delayStarts = {
            bottom: 10,
            top: counterLimit
        }
        setAnimatedUFO(LS, 200, true)
        LS.append('h2').html('we are loading the content')

        animateRaioOVNI()
    },
    remove: () => {
        loadingScreen.remove()
    }
}

////////////////////////////////////////////////////////////////////////////////////////////
// div .UFO
let UFOloadings = {
    raio: false,
    vaca: false,
    ovni: false
}
const resetUFOLoadings = () => {
    UFOloadings = {
        raio: false,
        vaca: false,
        ovni: false
    }
}
const setAnimatedUFO = (selection, width, vaca) => {
    resetUFOLoadings()
    const UFOdiv = selection.append('div').attr('class', 'UFO').style('width', `${width}px`)

    UFOdiv.append('object').attr('type', 'image/svg+xml').attr('data', './imgs/loading/Loading_raio.svg').attr('class', 'ovni_raio')
            .on('load', (e) => {
                UFOloadings.raio = true
                if(UFOloadings.vaca) setVacaPosition()
            })
    if(vaca){
        UFOdiv.append('object').attr('type', 'image/svg+xml').attr('data', './imgs/loading/vaca.svg').attr('class', 'ovni_vaca')
                .on('load', (e) => {
                    UFOloadings.vaca = true
                    if(UFOloadings.raio) setVacaPosition()
                })
    }
    UFOdiv.append('object').attr('type', 'image/svg+xml').attr('data', './imgs/loading/Loading_OVNI.svg').attr('class', 'ovni')
            .on('load', (e) => {UFOloadings.ovni = true})

    return UFOdiv
}
                            ////////////////////////
                            ////////////////////////
    const setVacaPosition = () => {
        const ovni_raioOBJECT = document.querySelector('.UFO > .ovni_raio')
        const ovni_raio = ovni_raioOBJECT.contentWindow.document.querySelector('svg > polygon')
        const ovni_vacaOBJECT = document.querySelector('.UFO > .ovni_vaca')

        const bounds = {
            ovni_vaca: ovni_vacaOBJECT.getBoundingClientRect(),
            ovni_raio: ovni_raio.getBoundingClientRect()
        }
        ovni_vacaOBJECT.style.translate = `0 ${bounds.ovni_raio.height - bounds.ovni_vaca.height}px`
    }
    ////////////////
    // animar UFO
    let counterLimit = -1
    let delayStarts = {
        bottom: -1,
        top: -1
    }
    let direction = 1
                            ////////////////////////
                            ////////////////////////
    const animateRaioOVNI = (timestamp) => {
        const ovni_raioOBJECT = document.querySelector('.UFO > .ovni_raio')
        const ovni_raio = ovni_raioOBJECT.contentWindow.document.querySelector('svg > polygon')
        const ovni_vacaOBJECT = document.querySelector('.UFO > .ovni_vaca')

        if(UFOloadings.raio){
            let count = ovni_raio.getAttribute('count')

            if(count === null) ovni_raio.setAttribute('count', 0)
            else{
                count = parseInt(count)
                if(count <= 0 && direction === -1 || (count >= counterLimit && direction === 1)) direction *= -1

                ////////////////
                // definir coords dos pontos laterais (do raio)
                const pY =  d3.scaleLinear([delayStarts.bottom, delayStarts.top], [1920, 0])
                const pX1 = d3.scaleLinear([delayStarts.bottom, delayStarts.top], [0, 540])
                const pX2 = d3.scaleLinear([delayStarts.bottom, delayStarts.top], [1080, 540])

                ////////////////
                // Função de animar através do 'count' (variavel q muda a cada iteração (quase como um frameCount))
                const doIAnimateByCount = () => (count < delayStarts.bottom || count > delayStarts.top) ? false : true

                if(doIAnimateByCount()){
                    ovni_raio.setAttribute(
                        'points',
                        `540,0 
                        ${pX1(count)},${pY(count)} 
                        ${pX2(count)},${pY(count)}`
                    )

                    if(UFOloadings.vaca){
                        const scaleVaca = d3.scaleLinear([delayStarts.bottom, delayStarts.top], [1, 0])
                        ovni_vacaOBJECT.style.scale = scaleVaca(count)
                        setVacaPosition()
                    }
                }

                ovni_raio.setAttribute('count', count + 1 * direction)
            }
        }

        requestAnimationFrame(animateRaioOVNI)
    }