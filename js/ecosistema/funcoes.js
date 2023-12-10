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




const addOnLoad = (fun) => {
    return window.addEventListener('load', fun)
}

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

const clearDOM = (selection) => selection.innerHTML = ''

const setDOMforData = () => {
    d3.select('body').append('div').attr('id','container')
    
    const divSlider = d3.select('body').append('div').attr('id','divSlider')
    divSlider.append('ol').attr('id', 'labelAnos')
    divSlider.append('input').attr('type', 'range').attr('id', 'sliderAnos')
}

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