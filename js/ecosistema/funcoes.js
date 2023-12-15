



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
// moda de um array
const moda = array => 
  Object.values(
    array.reduce((count, elemento) => {
      if (!(elemento in count)) {
        count[elemento] = [0, elemento];
      }
      
      count[elemento][0]++;
      return count;
    }, {})
  ).reduce((array, value) => value[0] < array[0] ? array : value, [0, null])[1];
;

////////////////////////////////////////////////////////////////////////////////////////////
// filtragem da shapegroup para imagem (a imagem associada)
const getImageByShapeGroup = (shapeGroup, version) => {
    let string = ''

    switch(shapeGroup){
        case 'other':
            string = 'unk';
            break;
        
        case 'V shape':
            string = 'v';
            break;
        
        case 'cylinder':
            string = 'cyl';
            break;

                case 'round':
                    string = 'oval';
                    break;
        
        case 'cone':
            string = 'cone';
            break;

        case 'crescent':
            string = 'Cresc';
            break;

        case 'cross':
            string = 'Cross';
            break;
        
        case 'triangle':
            string = 'tria';
            break;
        
        case 'diamond':
            string = 'dimon';
            break;

                case 'ellipse':
                    string = 'oval';
                    break;
        
        case 'oval':
            string = 'oval';
            break;

        case 'circle of light':
            string = 'circ';
            break;
        
        case 'formation':
            string = 'formation';
            break;

        case 'hexagon':
            string = 'Hex';
            break;
        
        case 'pyramid':
            string = 'pyra';
            break;

        case 'rectangle':
            string = 'rect';
            break;

        case 'teardrop':
            string = 'tear';
            break;
        }

    return './imgs/shapes//Shape_' + string + ((version === 2) ? version : '') + '.svg'
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
        const LSdiv = d3.select('body').append('div').attr('id','loadingScreen')
                        .classed('viewport', true).classed('centrado_absolute', true)
                        .append('div')
                            .classed('centrado_absolute', true)

        LSdiv.append('img').attr('alt', '').attr('src', './imgs/loading.gif')
        LSdiv.append('h2').html('ecrã de loading(seria giro ter um UFO a girar aqui)')
    },
    remove: () => loadingScreen.remove()
}

////////////////////////////////////////////////////////////////////////////////////////////
// div .UFO
const animatedUFO = (selection, width, vaca) => {
    const UFOdiv = selection.append('div').attr('class', 'UFO').style('width', `${width}px`)


    UFOdiv.append('object').attr('type', 'image/svg+xml').attr('data', './imgs/loading/Loading_raio.svg').attr('class', 'ovni_raio')
    if(vaca) UFOdiv.append('object').attr('type', 'image/svg+xml').attr('data', './imgs/loading/vaca.svg')
    UFOdiv.append('object').attr('type', 'image/svg+xml').attr('data', './imgs/loading/Loading_OVNI.svg').attr('class', 'ovni')
}

    const counterLimit = 60 * 4
    const delayStarts = {
        bottom: 30,
        top: counterLimit - 30
    }
    let direction = 1
    const animateRaioOVNI = (timestamp) => {
        const ovni_raioOBJECT = document.querySelector('.UFO > .ovni_raio')
        const ovni_raio = ovni_raioOBJECT.contentWindow.document.querySelector('svg > polygon')

        if(ovni_raio !== null){
            let count = ovni_raio.getAttribute('count')

            if(count === null) ovni_raio.setAttribute('count', 0)
            else{
                count = parseInt(count)
                if(count <= 0 && direction === -1 || (count >= counterLimit && direction === 1)) direction *= -1

                const pointsAttr = ovni_raio.getAttribute('points')
                const points = pointsAttr.split(' ')
                const pointsToArray = points.map((item, index) => {
                    if(index < 3){
                        const spliter = item.split(',')
                        return {
                            x: parseInt(spliter[0]),
                            y: parseInt(spliter[1])
                        }
                    }
                    else return null
                })

                /* const escala = d3.scaleLinear([0, counterLimit], [1920, 0]) */
                console.log(`${points[0]} ${pointsToArray[1].x},${pointsToArray[1].y} ${pointsToArray[2].x},${pointsToArray[2].y}`)

                ovni_raio.setAttribute('count', count + 1 * direction)
            }
        }

        requestAnimationFrame(animateRaioOVNI)
    }