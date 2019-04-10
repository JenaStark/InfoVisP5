var width =700;
var height= 700;
var data;

window.onload = start;

function start() {
	// load all the data in
	d3.csv("colleges.csv", function(csv) {
		// include all useful values to be visualized here
	    for (var i=0; i<csv.length; ++i) {
			csv[i].SATAverage = Number(csv[i]['SAT Average']);
			csv[i].AverageCost = Number(csv[i]['Average Cost']);
			csv[i].AdmissionRate =  Number(csv[i]['Admission Rate']);
	    }
	    data = csv
	    drawDefaultGraph();
	});
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
	   .on("click", function(d,i){ 
       });

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
	   .on("click", function(d,i){ 
       });

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
