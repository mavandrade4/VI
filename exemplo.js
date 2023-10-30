window.onload = function(){
    d3.csv("data/UFO_sights.csv", d3.autoType).then(lineGraph);

    function lineGraph(data){

        let svg = d3.select('body').append('svg')
            .attr('width', 500)
            .attr('height', 500);

/* exemplo da aula
        // escalas
        let sX = d3.scaleLinear()
            .domain(d3.extent(data, d=>  d.Year))
            .range([50, 450]);

        let sY = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.Coffee)])
            .range([450, 50]);

        // linha
        let line = d3.line()
            .x(d => sX(d.Year))
            .y(d => sY(d.Coffee))

        svg.append('g')
            .append('path')
            .datum(data)
            .attr('d', line)
            .attr('fill', 'none')
            .attr('stroke', 'black')


        // area
        let lineT = d3.area()
            .x(d => sX(d.Year))
            .y0(450)
            .y1(d => sY(d.Tea))

        svg.append('g')
            .append('path')
            .datum(data)
            .attr('d', lineT)
            .attr('fill', 'black')
            .attr('stroke', 'black')

        // simbolos
        let syb = d3.symbol()
            .type(d3.symbolTriangle)
            .size(30)

        svg.append('g')
            .selectAll('path')
            .data(data)
            .enter()
            .append('path')
            .attr('d', syb)
            .attr('transform', d => 'translate('+sX(d.Year)+','+sY(d.Coffee)+')')
*/

    }
}