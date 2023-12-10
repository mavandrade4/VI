// ufo_data / dataTotal
let dataTotal = undefined
/*
  ==== dateTimeObject: objeto de data, tem/terá, vários parâmetros
  {
    datetime:       [string] (data no formato do CSV: mm/dd/yy hh:minmin)
      data:         [string] (data no formato mm/dd/yyyy)
      horario:      [string] (hórario em hh:minmin)
        dia:        [number] (dd / d)
        mes:        [number] (mm / m)
        ano:        [number] (yyyy)
        hora:       [number] (hh / h)
        minutos:    [number] (minmin / min)
  }
*/
let dateTimeObject = undefined

// array de todos os anos do CSV (em cada index)
let todosAnos = []
// objeto "Ano" que contém o ano minimo, maximo do CSV e o "atual selecionado" (contido no CSV)
let ano = {}

/*
   ==== dadosAtuais: objeto que contem os dados atuais (do intervalo / ano escolhido)
  e os indices associados a esses anos
  {
    indexes:      [number array] (contém os indíces referentes ao CSV original)
    anos:         [number array] (anos, só para debug)
  }
*/
let dadosAtuais = {
  indexes: [],
  anos: []
}

/* ====================
    colocar os dados atuais relativos ao intervalo selecionado
*/
const setDadosAtuais = () => {
  dadosAtuais = {
      indexes: [],
      anos: [],
      objetos: []
  }
  
  dadosAtuais.anos = todosAnos.filter((ANO, index) => {
      if(ANO === ano.atual){
          dadosAtuais.objetos.push(dataTotal[index])
          dadosAtuais.indexes.push(index)
      }
      return (ANO === ano.atual)
    })
  
  const atualOnit = document.querySelector('span.onit')
  if(atualOnit !== null) atualOnit.classList.remove('onit')
  document.querySelector('span[name="' + ano.atual + '"]').classList.add('onit')
}

/* ====================
    dar load aos dados tratados
*/
const loadDadosTratados = async (onStart) => {
  onStart()

  return (
    d3.csv("../../data/dados_tratados.csv")
      .then((ufo_data) => {
        dataTotal = ufo_data

        const datetime = ufo_data.map((d) => d.datetime)

        dateTimeObject = datetime.map(
          (dt) => funcoesDateTime.objeto(dt)
        )

        todosAnos = dateTimeObject.map((dtObj) => dtObj.ano)
        ano = {
          min: Math.min(...todosAnos),
          max: Math.max(...todosAnos),
          atual: todosAnos[parseInt(Math.random() * todosAnos.length)]
        }

        for(let i = 0; i <= ano.max - ano.min; i++){
            const span = d3.select(labelAnos).append('li').append('span')

            span.attr('name', ano.min + i).text(ano.min + i)

            if(!todosAnos.includes(ano.min + i)) span.attr('class', 'notexist')
        }

        console.log(ano)

        setDadosAtuais()

    })
  )
}