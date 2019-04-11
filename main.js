var width =700;
var height= 700;
var data, div;

window.onload = start;

function start() {
	// load all the data in

	// Define the div for the tooltip
	div = d3.select("body").append("div")	
		.attr("class", "tooltip")				
		.style("opacity", 0);

	d3.select('.close')
		.on('click', () => {
			d3.select('.modal').style('display', 'none')
		})

	d3.csv("colleges.csv", function(d) {
		d3.entries(d).forEach(entry => {
			if (!isNaN(entry.value)) {
				d[entry.key] = Number(entry.value);
			}
		})
		return d;
	}, function(csv) {
		// include all useful values to be visualized here
	    for (var i=0; i<csv.length; ++i) {
			csv[i].SATAverage = csv[i]['SAT Average'];
			csv[i].AverageCost = csv[i]['Average Cost'];
			csv[i].AdmissionRate = csv[i]['Admission Rate'];
	    }
	    data = csv
	    drawDefaultGraph();
	});

}

function fillDetails(datapoint, i) {
	d3.selectAll('#details > *').remove()
	d3.select('.modal')
		.style('display', 'block')

	var entries = d3.entries(datapoint);
	var enterSelection = d3.select('#details').selectAll('div').data(entries).enter().append('div')
	enterSelection.insert('strong').text((d) => d.key + ':');
	enterSelection.insert('span').text((d) => d.value);
}

// Graph SAT Average and Average Cost
function drawDefaultGraph() {
	// filter out zero values
	cleanData = data.filter(function(d){
        if(d.SATAverage == 0 || d.AverageCost == 0){
            return false;
        }
        return true;
    });

    var satAverageExtent = d3.extent(cleanData, function(row) { return row.SATAverage; });
    var averageCostExtent = d3.extent(cleanData, function(row) { return row.AverageCost; });
       
    var extents = {
	"SATAvg": satAverageExtent,
	"AvgCost": averageCostExtent
    }; 

    // Axis setup
    var xScale = d3.scaleLinear().domain(satAverageExtent).range([50, 670]);
    var yScale = d3.scaleLinear().domain(averageCostExtent).range([670, 30]);
     
    var xAxis = d3.axisBottom().scale(xScale);
    var yAxis = d3.axisLeft().scale(yScale);

    // Remove old elements from chart
    d3.selectAll("#chart > *").remove();
	d3.selectAll('#details > *').remove()

    // Add new svg
    var chart = d3.select("#chart")				
		.append('svg:svg')
	    .attr("width",width)
	    .attr("height",height);

	 //add scatterplot points
     var temp1= chart.selectAll("circle")
	   .data(cleanData)
	   .enter()
	   .append("circle")
	   .attr("id",function(d,i) {return i;} )
	   .attr("fill", function(d) {
		   	if(d.Control == 'Public') {
		   		return "orange";
		   	}
		   	return "green";
	    })
	   .attr("stroke", "black")
	   .attr("cx", function(d) { return xScale(d.SATAverage); })
	   .attr("cy", function(d) { return yScale(d.AverageCost); })
	   .attr("r", 5)
	   .on("click", fillDetails);

	// draw axis
    chart // or something else that selects the SVG element in your visualizations
		.append("g") // create a group node
		.attr("transform", "translate(0,"+ (width -30)+ ")")
		.call(xAxis) // call the axis generator
		.append("text")
		.attr("class", "label")
		.attr("x", width-16)
		.attr("y", -6)
		.style("text-anchor", "end")
		.text("Average SAT");

	// draw axis
    chart // or something else that selects the SVG element in your visualizations
		.append("g") // create a group node
		.attr("transform", "translate(50, 0)")
		.call(yAxis)
		.append("text")
		.attr("class", "label")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text("Average Cost");

};

// Graph SAT Average and Admission Rate
function drawSecondGraph() {
	// filter out zero values
	cleanData = data.filter(function(d){
        if(d.SATAverage == 0 || d.AdmissionRate == 0){
            return false;
        }
        return true;
    });

    var satAverageExtent = d3.extent(cleanData, function(row) { return row.SATAverage; });
    var admissionRateExtent = d3.extent(cleanData, function(row) { return row.AdmissionRate; });
       
    var extents = {
	"SATAvg": satAverageExtent,
	"admissionRate": admissionRateExtent
    }; 

    // Axis setup
    var xScale = d3.scaleLinear().domain(satAverageExtent).range([50, 670]);
    var yScale = d3.scaleLinear().domain(admissionRateExtent).range([670, 30]);
     
    var xAxis = d3.axisBottom().scale(xScale);
    var yAxis = d3.axisLeft().scale(yScale);
 
   // Remove old elements from chart
	d3.selectAll("#chart > *").remove();
	d3.selectAll('#details > *').remove();

    // Add new svg
    var chart = d3.select("#chart")				
		.append('svg:svg')
	    .attr("width",width)
	    .attr("height",height);

	 //add scatterplot points
     var temp1= chart.selectAll("circle")
	   .data(cleanData)
	   .enter()
	   .append("circle")
	   .attr("id",function(d,i) {return i;} )
	   .attr("fill", function(d) {
		   	if(d.Control == 'Public') {
		   		return "orange";
		   	}
		   	return "green";
	    })
	   .attr("stroke", "black")
	   .attr("cx", function(d) { return xScale(d.SATAverage); })
	   .attr("cy", function(d) { return yScale(d.AdmissionRate); })
	   .attr("r", 5)
	   .on("click", fillDetails);

	// draw axis
    chart // or something else that selects the SVG element in your visualizations
		.append("g") // create a group node
		.attr("transform", "translate(0,"+ (width -30)+ ")")
		.call(xAxis) // call the axis generator
		.append("text")
		.attr("class", "label")
		.attr("x", width-16)
		.attr("y", -6)
		.style("text-anchor", "end")
		.text("Average SAT");

	// draw axis
    chart // or something else that selects the SVG element in your visualizations
		.append("g") // create a group node
		.attr("transform", "translate(50, 0)")
		.call(yAxis)
		.append("text")
		.attr("class", "label")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text("Admission Rate");
};

function drawGraph(button) {
	if (button.id === 'retention') {
		actualDrawGraph('Admission Rate', 'Retention Rate (First Time Students)');
	} else if (button.id === 'income') {
		actualDrawGraph('Average Cost', 'Average Family Income');
	} else if (button.id === 'testid') {
		actualDrawGraph('SAT Average', 'Average Family Income');
	} else {
		drawDefaultGraph();
	}
}

function actualDrawGraph(xLabel, yLabel) {
	cleanData = data
		.filter(function (d) {
			if (d[xLabel] == 0 || d[yLabel] == 0) {
				return false;
			}
			return true;
		});

    var xExtent = d3.extent(cleanData, row => row[xLabel] );
    var yExtent = d3.extent(cleanData, row => row[yLabel] );
       
	var extents = {
		xLabel: xExtent,
		yLabel: yExtent
	}; 

    // Axis setup
    var xScale = d3.scaleLinear().domain(xExtent).range([50, 670]);
    var yScale = d3.scaleLinear().domain(yExtent).range([670, 30]);
     
    var xAxis = d3.axisBottom().scale(xScale);
    var yAxis = d3.axisLeft().scale(yScale);
 
   // Remove old elements from chart
    d3.selectAll("#chart > *").remove();
	d3.selectAll('#details > *').remove()
	d3.selectAll('#filters > *').remove();

    // Add new svg
    var chart = d3.select("#chart")				
		.append('svg:svg')
	    .attr("width",width)
	    .attr("height",height);

	 //add scatterplot points
	var temp1= chart.selectAll("circle")
	   .data(cleanData)
	   .enter()
	   .append("circle")
	   .attr("id",function(d,i) {return i;} )
	   .attr("fill", function(d) {
		   	if(d.Control == 'Public') {
		   		return "orange";
		   	}
		   	return "green";
	    })
	   .attr("stroke", "black")
	   .attr("cx", function(d) { return xScale(d[xLabel]); })
	   .attr("cy", function(d) { return yScale(d[yLabel]); })
	   .attr("r", 5)
	   .on("click", fillDetails)
	   .on("mouseover", function(d) {		
		   div.transition()
			   .duration(200)
			   .style("opacity", .9);
		   div.html(d.Name + "<br/>")
			   .style("left", (d3.event.pageX) + "px")
			   .style("top", (d3.event.pageY - 40) + "px");
	   })
		.on("mouseout", function (d) {
			div.transition()
				.duration(500)
				.style("opacity", 0);
		});;

	// draw axis
    chart // or something else that selects the SVG element in your visualizations
		.append("g") // create a group node
		.attr("transform", "translate(0,"+ (width -30)+ ")")
		.call(xAxis) // call the axis generator
		.append("text")
		.attr("class", "label")
		.attr("x", width-16)
		.attr("y", -6)
		.style("text-anchor", "end")
		.text(xLabel);

	// draw axis
    chart // or something else that selects the SVG element in your visualizations
		.append("g") // create a group node
		.attr("transform", "translate(50, 0)")
		.call(yAxis)
		.append("text")
		.attr("class", "label")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text(yLabel);
	


	// FILTERS

	filters = d3.select('#filters')

	controls = ['All', 'Public', 'Private']	
	filters
		.append('p')
		.append('select')
		.on('change', function() {
			if (this.value === 'All') {
				chart.selectAll('circle')
					.transition()
					.duration(Math.random() * 1000)
					.style('opacity', 1)
			} else {
				chart.selectAll('circle')
					.filter(d => d.Control !== this.value)
					.transition()
					.duration(Math.random() * 1000)
					.style('opacity', 0)
				chart.selectAll('circle')
					.filter(d => d.Control === this.value)
					.transition()
					.duration(Math.random() * 1000)
					.style('opacity', 1)
			}
		})
		.selectAll('option')
		.data(controls)
		.enter()
		.append('option')
			.text(d => d)
		
}
