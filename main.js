var width =700;
var height= 700;
var data, div;

window.onload = start;

function start() {
	// Define the div for the tooltip
	div = d3.select("body").append("div")	
		.attr("class", "tooltip")				
		.style("opacity", 0);

	d3.select('.close')
		.on('click', () => {
			d3.select('.modal').style('display', 'none')
		})

	// load all the data in
	d3.csv("colleges.csv", function(d) {
		d3.entries(d).forEach(entry => {
			if (!isNaN(entry.value)) {
				d[entry.key] = Number(entry.value);
			}
		})
		return d;
	}, function(csv){
		data = csv;
		// Draw default chart
		// Important to have this only be drawn after data is loaded so leave in this function
		actualDrawGraph('SAT Average', 'Average Cost');
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

function drawGraph(button) {
	if (button.id === 'retention') {
		actualDrawGraph('Admission Rate', 'Retention Rate (First Time Students)');
	} else if (button.id === 'income') {
		actualDrawGraph('Average Cost', 'Average Family Income');
	} else if (button.id === 'scorecost') {
		actualDrawGraph('SAT Average', 'Average Cost');
	}
}

function actualDrawGraph(xLabel, yLabel) {
	xAttribute = xLabel
	yAttribute = yLabel
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
    xScale = d3.scaleLinear().domain(xExtent).range([50, 670]);
    yScale = d3.scaleLinear().domain(yExtent).range([670, 30]);
     
    xAxis = d3.axisBottom().scale(xScale);
    yAxis = d3.axisLeft().scale(yScale);
 
   // Remove old elements from chart
    d3.selectAll("#chart > *").remove();
	d3.selectAll('#details > *').remove()
	d3.selectAll('#filters > *').remove();
	d3.select('.modal').style('display', 'none')

    // Add new svg
    chart = d3.select("#chart")				
		.append('svg:svg')
	    .attr("width",width)
	    .attr("height",height);

	// Add a clipPath: everything out of this area won't be drawn. (helpful for zooming and panning)
  	var clip = chart.append("defs").append("chart:clipPath")
      .attr("id", "clip")
      .append("chart:rect")
      .attr("width", width- 68) // using scale ranges and their translation to calculate this
      .attr("height", height- 48)
      .attr("x", 44)
      .attr("y", 24);

	var clippedArea = chart.append('g')
	  .attr("clip-path", "url(#clip)")

	// Set zooming functionality
	var zoom = d3.zoom()
		.scaleExtent([1, 40])
		.translateExtent([[-100, -100], [width + 90, height + 100]])
		.on("zoom", updateZoom);

	//add scatterplot points (only within clipped area)
	var points = clippedArea.selectAll("circle")
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
		.attr("transform", "translate(0,"+ (height-30)+ ")")
		.attr("class", "xaxis")
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
		.attr("class", "yaxis")
		.call(yAxis)
		.append("text")
		.attr("class", "label")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text(yLabel);

	chart.call(zoom);

	// FILTERS
	filters = d3.select('#filters')

	// Add public/private filtering
	controls = ['All', 'Public', 'Private']	
	filters
		.append('span')
		.text('Public/Private: ')
		.append('select')
		.on('change', function() {
			filter(chart, 'Control', this.value);
		})
		.selectAll('option')
		.data(controls)
		.enter()
		.append('option')
			.text(d => d)

	// Region filtering
	regions = ['All', 'Far West', 'Great Lakes', 'Great Plains', 'Mid-Atlantic',
	'New England', 'Outlying Areas', 'Rocky Mountains', 'Southeast', 'Southwest']	
	filters
		.append('span')
		.text('Region: ')
		.append('select')
		.on('change', function() {
			filter(chart, 'Region', this.value);
		})
		.selectAll('option')
		.data(regions)
		.enter()
		.append('option')
			.text(d => d)
}

function filter(chart, filterAttribute, value) {
	if (value === 'All') {
		chart.selectAll('circle')
			.transition()
			.duration(Math.random() * 1000)
			.style('opacity', 1)
	} else {
		chart.selectAll('circle')
			.filter(d => d[filterAttribute] !== value)
			.transition()
			.duration(Math.random() * 1000)
			.style('opacity', 0)
		chart.selectAll('circle')
			.filter(d => d[filterAttribute] === value)
			.transition()
			.duration(Math.random() * 1000)
			.style('opacity', 1)
	}
}

function updateZoom() {
  // Update Scales
  new_yScale = d3.event.transform.rescaleY(yScale);
  new_xScale = d3.event.transform.rescaleX(xScale);
  gX = d3.select('.xaxis');
  gY = d3.select('.yaxis');
  gX.call(xAxis.scale(new_xScale));
  gY.call(yAxis.scale(new_yScale));

  // Update scatter points
  chart
      .selectAll("circle")
      .attr('cx', function(d) {return new_xScale(d[xAttribute])})
      .attr('cy', function(d) {return new_yScale(d[yAttribute])});
}
