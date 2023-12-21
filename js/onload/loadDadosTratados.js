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
// array com todos os anos pertencentes ao CSV (singularmente, unica instancia)
let anosSingular = []
// igual ao de cima mas com anos sem dados (entre os q têm dados)
let anosSingularWithNot = []


const anosSingularWithNot_OBJECT = () => {
  let array = []

  anosSingularWithNot.forEach(
    singular => {
      let aparecimentos = 0
      contador(todosAnos).forEach(
        aparecimentosAno => {
          if(aparecimentosAno[1] === singular) aparecimentos = aparecimentosAno[0]
        }
      )
      array.push(
        {
          ano: singular,
          data: aparecimentos
        }
      )
    }
  )

  return array
}


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
    d3.csv("data/dados_tratados.csv")
      .then((ufo_data) => {
        dataTotal = ufo_data

        const datetime = ufo_data.map((d) => d.datetime)

        dateTimeObject = datetime.map(
          (dt) => funcoesDateTime.objeto(dt)
        )

        todosAnos = dateTimeObject.map((dtObj) => dtObj.ano)
        contador(todosAnos).forEach(a => anosSingular.push(a[1]))

        ano = {
          min: Math.min(...todosAnos),
          max: Math.max(...todosAnos),
          atual: todosAnos[parseInt(Math.random() * todosAnos.length)]
        }

        for(let i = 0; i <= ano.max - ano.min; i++){ anosSingularWithNot.push(ano.min + i) }


        /*  */
        let aparecimentosByIndexAnos = []
        anosSingularWithNot_OBJECT().forEach(
          anos => {
            aparecimentosByIndexAnos.push(anos.data)
          }
        )
        /*  */

        const aparecimentoMax = Math.max(...aparecimentosByIndexAnos)

        const escalaRect = d3
              .scalePow([0, aparecimentoMax], [5, 50])
              .exponent(0.3)



        // definir as listas pretencentes à barra de input
        d3.select(document.body).append('span').attr('id', 'aparecimentosMany')
        let listas = d3.select(labelAnos)
          .selectAll('li')
          .data(anosSingularWithNot_OBJECT()).enter()
          .append('li')
          
                listas.append('span').attr('name', d => d.ano).text(d => d.ano)

                listas.filter(d => !anosSingular.includes(d.ano))
                      .selectAll('span').attr('class', 'notexist')

                listas
                  .append('div')
                  .style('height', d => `${escalaRect(d.data)}px`)
                  .on('mouseenter', (e, d) => {
                    const bounds = e.currentTarget.getBoundingClientRect()
  
                    d3
                      .select(aparecimentosMany)
                      .text(`${d.data} appear${(d.data === 1) ? '' : 's'}`)
                      .attr('style', `
                        top: ${bounds.top - 20}px;
                        left: ${bounds.left + bounds.width * 0.5}px
                      `)
                      .classed('show', true)
                  })
                  .on('mouseleave', (e, d) => d3.select(aparecimentosMany).classed('show', false))

        setDadosAtuais()

    })
  )
}