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
                    string = 'oval';
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

    return 'Shape_' + string + ((version === 2) ? version : '') + '.svg'
}