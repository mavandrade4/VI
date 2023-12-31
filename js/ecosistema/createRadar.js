/*
  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  ================================================================
  feito sobre o código de https://observablehq.com/@alison990222/radar-chart/2
  ================================================================
  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
*/


    //////////////////////////////////////////////////////////////
    //////////////////////// Set-Up //////////////////////////////
    //////////////////////////////////////////////////////////////
  
    var margens = { top: 100, right: 100, bottom: 100, left: 100 },
      w = 300,
      h = 300;
  
    //////////////////////////////////////////////////////////////
    ////////////////////////// Data //////////////////////////////
    //////////////////////////////////////////////////////////////

    let filtrosRadar = allShapeGroups

    let paisDataAtual = null
    const setDadosPaisForRadar = () => {
        dadosPaisForRadar = [
            createDadosPaisForRadar(paisDataAtual)
        ]
    }

    const createObjectForRadar = () => {
        const array = []
        filtrosRadar.forEach(
            (shapeGroup) => array.push(createBaseForRadar([0, shapeGroup]))
        )
        return array
    }
  
    const createBaseForRadar = (shapeGroupsQuantidade) => {
        return {
            axis: shapeGroupsQuantidade[1],
            value: shapeGroupsQuantidade[0]
        }
    }

    const createDadosPaisForRadar = (listaShapeGroupsQuantidade) => {
        let arrayComDados = createObjectForRadar()

        listaShapeGroupsQuantidade.forEach(
            (item) =>{
                arrayComDados.forEach(
                    (filtrado) => {
                        if(item[1] === filtrado.axis) filtrado.value = item[0]
                    }
                )
            }
        )
        return arrayComDados
    }
    var dadosPaisForRadar = [
/*       [
        //Samsung
        { axis: "Battery Life", value: 0.27 },
        { axis: "Brand", value: 0.16 },
        { axis: "Contract Cost", value: 0.35 },
        { axis: "Design And Quality", value: 0.13 },
        { axis: "Have Internet Connectivity", value: 0.2 },
        { axis: "Large Screen", value: 0.13 },
        { axis: "Price Of Device", value: 0.35 },
        { axis: "To Be A Smartphone", value: 0.38 }
      ], */
    ];
    //////////////////////////////////////////////////////////////
    //////////////////// Draw the Chart //////////////////////////
    //////////////////////////////////////////////////////////////
  
    var radarChartOptions = {
      w: w,
      h: h,
      margin: margens,
      maxValue: 0,
      levels: 4,
      roundStrokes: true,
    };
  

  
function RadarChartSelection(selection){
    return RadarChart(selection, dadosPaisForRadar, radarChartOptions)
}
function RadarChart(selection, data, options) {
    /////////////////////////////////////////////////////////
    /////////////////// Helper Function /////////////////////
    /////////////////////////////////////////////////////////
  
    //Taken from http://bl.ocks.org/mbostock/7555321
    //Wraps SVG text
    function wrap(text, width) {
      text.each(function() {
        var text = d3.select(this),
          words = text
            .text()
            .split(/\s+/)
            .reverse(),
          word,
          line = [],
          lineNumber = 0,
          lineHeight = 1.4, // ems
          y = text.attr("y"),
          x = text.attr("x"),
          dy = parseFloat(text.attr("dy")),
          tspan = text
            .text(null)
            .append("tspan")
            .attr("x", x)
            .attr("y", y)
            .attr("dy", dy + "em")
  
        while ((word = words.pop())) {
          line.push(word);
          tspan.text(line.join(" "));
          if (tspan.node().getComputedTextLength() > width) {
            line.pop();
            tspan.text(line.join(" "));
            line = [word];
            tspan = text
              .append("tspan")
              .attr("x", x)
              .attr("y", y)
              .attr("dy", ++lineNumber * lineHeight + dy + "em")
              .text(word);
          }
        }
      });
    } //wrap
  
    var cfg = {
      w: 600, //Width of the circle
      h: 600, //Height of the circle
      margin: { top: 20, right: 20, bottom: 20, left: 20 }, //The margins of the SVG
      levels: 3, //How many levels or inner circles should there be drawn
      maxValue: 0, //What is the value that the biggest circle will represent
      labelFactor: 1.3, //How much farther than the radius of the outer circle should the labels be placed
      wrapWidth: 60, //The number of pixels after which a label needs to be given a new line
      opacityArea: 0.35, //The opacity of the area of the blob
      dotRadius: 4, //The size of the colored circles of each blog
      opacityCircles: 0.1, //The opacity of the circles of each blob
      strokeWidth: 2, //The width of the stroke around each blob
      roundStrokes: false, //If true the area and stroke will follow a round path (cardinal-closed)
      color: d3.scaleOrdinal(coresGraph) //Color function
    };
  
    //Put all of the options into a variable called cfg
    if ("undefined" !== typeof options) {
      for (var i in options) {
        if ("undefined" !== typeof options[i]) {
          cfg[i] = options[i];
        }
      } //for i
    } //if
  
    //If the supplied maxValue is smaller than the actual one, replace by the max in the data
    var maxValue = Math.max(
      cfg.maxValue,
      d3.max(data, function(i) {
        return d3.max(
          i.map(function(o) {
            return o.value;
          })
        );
      })
    );
  
    var allAxis = data[0].map(function(i, j) {
        return i.axis;
      }), //Names of each axis
      total = allAxis.length, //The number of different axes
      radius = Math.min(cfg.w / 2, cfg.h / 2), //Radius of the outermost circle
      Format = d3.format(".0f"), //Percentage formatting
      angleSlice = (Math.PI * 2) / total; //The width in radians of each "slice"
  
    //Scale for the radius
    var rScale = d3
      .scaleLinear()
      .range([radius / 16, radius + radius / 16])
      .domain([0, (maxValue === 0) ? 1 : maxValue]);
  
    /////////////////////////////////////////////////////////
    //////////// Create the container SVG and g /////////////
    /////////////////////////////////////////////////////////
  
    //Calculate width and height
    var height = cfg.h + cfg.margin.top + cfg.margin.bottom;
    var width = cfg.w + cfg.margin.left + cfg.margin.right;
  
    //Initiate the radar chart SVG
    var svg = selection.append('svg').attr("viewBox", [0, 0, width, height])
  
    //Append a g element
    var grupo = svg
      .append("g")
      .attr(
        "transform",
        "translate(" +
          (cfg.w / 2 + cfg.margin.left) +
          "," +
          (cfg.h / 2 + cfg.margin.top) +
          ")"
      );
  

  
    /////////////////////////////////////////////////////////
    /////////////// Draw the Circular grid //////////////////
    /////////////////////////////////////////////////////////
  
    //Wrapper for the grid & axes
    var axisGrid = grupo.append("g").attr("class", "axisWrapper");
  
    //Draw the background circles
    axisGrid
      .selectAll(".levels")
      .data(d3.range(1, cfg.levels + 1).reverse())
      .enter()
      .append("circle")
      .attr("class", "gridCircle")
      .attr("r", function(d, i) {
        return ((radius + radius / 16) / cfg.levels) * d;
        //mudar raio (minimo n é o centro) #vemca
      })
      .style("fill", "#CDCDCD")
      .style("stroke", "#CDCDCD")
      .style("fill-opacity", cfg.opacityCircles)
  
    //Text indicating at what % each level is
    axisGrid
      .selectAll(".axisLabel")
      .data(d3.range(1, cfg.levels + 1).reverse())
      .enter()
      .append("text")
      .attr("class", "labelRaio")
      .attr("x", 4)
      .attr("y", function(d) {
        return (-d * radius) / cfg.levels;
      })
      .attr("dy", "0.4em")
      .text(function(d, i) {
        return Format((maxValue * d) / cfg.levels);
      });
  
    /////////////////////////////////////////////////////////
    //////////////////// Draw the axes //////////////////////
    /////////////////////////////////////////////////////////
  
    //Create the straight lines radiating outward from the center
    var axis = axisGrid
      .selectAll(".axis")
      .data(allAxis)
      .enter()
      .append("g")
      .attr("class", "axis");
  
    //Append the lines
    axis
      .append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", function(d, i) {
        return rScale(((maxValue === 0) ? 1 : maxValue) * 1.1) * Math.cos(angleSlice * i - Math.PI / 2);
      })
      .attr("y2", function(d, i) {
        return rScale(((maxValue === 0) ? 1 : maxValue) * 1.1) * Math.sin(angleSlice * i - Math.PI / 2);
      })
      .attr("class", "line")
      .style("stroke", "white")
      .style("stroke-width", "2px");
  
    //Append the labels at each axis
    axis
      .append("text")
      .attr("class", "filtroLegenda")
      .attr('name', d => d)
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("x", function(d, i) {
        return (
          rScale(((maxValue === 0) ? 1 : maxValue) * cfg.labelFactor) *
          Math.cos(angleSlice * i - Math.PI / 2)
        );
      })
      .attr("y", function(d, i) {
        return (
          rScale(((maxValue === 0) ? 1 : maxValue) * cfg.labelFactor) *
          Math.sin(angleSlice * i - Math.PI / 2)
        );
      })
      .text(function(d) {
        return d;
      })
      .call(wrap, cfg.wrapWidth);
  
    /////////////////////////////////////////////////////////
    ///////////// Draw the radar chart blobs ////////////////
    /////////////////////////////////////////////////////////
  
    //The radial line function
    var radarLine = d3
      .lineRadial()
      .curve(d3.curveLinearClosed)
      .radius(function(d) {
        return rScale(d.value);
      })
      .angle(function(d, i) {
        return i * angleSlice;
      });
  
    if (cfg.roundStrokes) {
      radarLine.curve(d3.curveLinearClosed);
    }
  
    //Create a wrapper for the blobs
    var blobWrapper = grupo
      .selectAll(".radarWrapper")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "radarWrapper");
  
    //Append the backgrounds
    blobWrapper
      .append("path")
      .attr("class", "radarArea")
      .attr("d", function(d, i) {
        return radarLine(d);
      })
      .style("fill", function(d, i) {
        return cfg.color(i);
      })
      .style("fill-opacity", cfg.opacityArea)
      .on("mouseover", function(d, i) {
        //Dim all blobs
        d3.selectAll(".radarArea")
          .transition()
          .duration(200)
          .style("fill-opacity", 0.1);
        //Bring back the hovered over blob
        d3.select(this)
          .transition()
          .duration(200)
          .style("fill-opacity", 0.7);
      })
      .on("mouseout", function() {
        //Bring back all blobs
        d3.selectAll(".radarArea")
          .transition()
          .duration(200)
          .style("fill-opacity", cfg.opacityArea);
      });
  
    //Create the outlines
    blobWrapper
      .append("path")
      .attr("class", "radarStroke")
      .attr("d", function(d, i) {
        return radarLine(d);
      })
      .style("stroke-width", cfg.strokeWidth + "px")
      .style("stroke", function(d, i) {
        return cfg.color(i);
      })
      .style("fill", "none")
  
    //Append the circles
    blobWrapper
      .selectAll(".radarCircle")
      .data(function(d, i) {
        return d;
      })
      .enter()
      .append("circle")
      .attr("class", "radarCircle")
      .attr("r", cfg.dotRadius)
      .attr("cx", function(d, i) {
        return rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2);
      })
      .attr("cy", function(d, i) {
        return rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2);
      })
      .style("fill", function(d) {
        return "#737373";
      })
      .style("fill-opacity", 0.8);
  
    /////////////////////////////////////////////////////////
    //////// Append invisible circles for tooltip ///////////
    /////////////////////////////////////////////////////////

    //Set up the small tooltip for when you hover over a circle
    var tooltip = grupo.append('g').style("opacity", 0);
      
    var tooltopTextSombra = tooltip
        .append("text")
        .attr("class", "tooltipSombra")

    var tooltopText = tooltip
        .append("text")
        .attr("class", "tooltip")
  
    //Wrapper for the invisible circles on top
    var blobCircleWrapper = grupo
      .selectAll(".radarCircleWrapper")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "radarCircleWrapper");
  
    //Append a set of invisible circles on top for the mouseover pop-up
    blobCircleWrapper
      .selectAll(".radarInvisibleCircle")
      .data(function(d, i) {
        return d;
      })
      .enter()
      .append("circle")
      .attr("class", "radarInvisibleCircle")
      .attr('name', d => d.axis)
      .attr("r", cfg.dotRadius * 1.5)
      .attr("cx", function(d, i) {
        return rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2);
      })
      .attr("cy", function(d, i) {
        return rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2);
      })
      .style("fill", "none")
      .style("pointer-events", "all")
      .on("mouseover", function(e, d, i) {
        var newX = parseFloat(d3.select(this).attr("cx")) - 10;
        var newY = parseFloat(d3.select(this).attr("cy")) - 10;
  
        tooltip
          .attr('transform', `translate(${newX}, ${newY})`)
          .transition()
          .duration(200)
          .style("opacity", 1);

        const filtroLegendaRespetivo = document.querySelector(`.filtroLegenda[name='${d.axis}']`)
        filtroLegendaRespetivo.classList.toggle('onHover')
        const boundsLegendas = filtroLegendaRespetivo.getBoundingClientRect()
        d3.select(iconHoverShapeData).attr('style',
            `
                top: ${boundsLegendas.y + boundsLegendas.height * 0.5}px;
                left: ${boundsLegendas.x + boundsLegendas.width * 0.5}px;
                opacity: 1;
                scale: 1;
            `
        ).attr('src', getImageByShapeGroup(d.axis))
        
        tooltopText.text(Format(d.value))
        tooltopTextSombra.text(Format(d.value))
      })
      .on("mouseout", function(e, d) {
        const filtroLegendaRespetivo = document.querySelector(`.filtroLegenda[name='${d.axis}']`)
        filtroLegendaRespetivo.classList.toggle('onHover')
        d3.select(iconHoverShapeData).attr('style','opacity: 0; scale: 0;')
        tooltip
          .transition()
          .duration(200)
          .style("opacity", 0);
      });
  
    return svg.node();
  } //RadarChart