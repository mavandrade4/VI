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