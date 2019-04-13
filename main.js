var width = 600;
var height = 600;
var data, div;
var setFilters = d3.map();

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
  // clear out old filters from other charts
  setFilters = d3.map();
  xAttribute = xLabel
  yAttribute = yLabel
  cleanData = data
    .filter(function (d) {
      if (d[xLabel] == 0 || d[yLabel] == 0) {
        return false;
      }
      return true;
    });

  var xExtent = d3.extent(cleanData, row => row[xLabel]);
  var yExtent = d3.extent(cleanData, row => row[yLabel]);

  var extents = {
    xLabel: xExtent,
    yLabel: yExtent
  }; 

  // Axis setup
  xScale = d3.scaleLinear().domain(xExtent).range([50, 570]);
  yScale = d3.scaleLinear().domain(yExtent).range([570, 30]);

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
    .attr("width", width)
    .attr("height", height);

  // Add a clipPath: everything out of this area won't be drawn. (helpful for zooming and panning)
  var clip = chart.append("defs").append("chart:clipPath")
    .attr("id", "clip")
    .append("chart:rect")
    .attr("width", width - 68) // using scale ranges and their translation to calculate this
    .attr("height", height - 48)
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
    .attr("id", function (d, i) { return i; })
    .attr("fill", function (d) {
      if (d.Control == 'Public') {
        return "orange";
      }
      return "green";
    })
    .attr("stroke", "black")
    .attr("cx", function (d) { return xScale(d[xLabel]); })
    .attr("cy", function (d) { return yScale(d[yLabel]); })
    .attr("r", 5)
    .on("click", fillDetails)
    .on("mouseover", function (d) {
      d3.select(this).attr('stroke', 'red').attr('stroke-width', '3px');
      div.transition()
        .duration(200)
        .style("opacity", .9);
      div.html(d.Name + "<br/>")
        .style("left", (d3.event.pageX + 10) + "px")
        .style("top", (d3.event.pageY - 40) + "px");
    })
    .on("mouseout", function (d) {
      d3.select(this).attr('stroke', 'black').attr('stroke-width', '1px');
      div.transition()
        .duration(500)
        .style("opacity", 0);
    });;

  // draw axis
  chart // or something else that selects the SVG element in your visualizations
    .append("g") // create a group node
    .attr("transform", "translate(0," + (height - 30) + ")")
    .attr("class", "xaxis")
    .call(xAxis) // call the axis generator
    .append("text")
    .attr("class", "label")
    .attr("x", width - 16)
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
    .attr('id', 'ControlFilter')
    .on('change', function () {
      setFilters.set("Control", this.value)
      filter(chart, setFilters);
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
    .attr('id', 'RegionFilter')
    .on('change', function () {
      setFilters.set("Region", this.value)
      filter(chart, setFilters);
    })
    .selectAll('option')
    .data(regions)
    .enter()
    .append('option')
      .text(d => d)

  // reset filters
  filters.append('p')
    .append('button')
    .text('Reset All Filters')
    .on('click', function () {
      // change filter selection text to 'All'
      document.getElementById('ControlFilter').value = 'All';
      document.getElementById('RegionFilter').value = 'All';

      // clear old filters and show all points
      setFilters = d3.map();
      chart.selectAll('circle')
        .transition()
        .duration(600)
        .style('opacity', 1)
    });
}

function filter(chart, filters) {
  circles = chart.selectAll('circle')
  // for each filter set go through and add each one to the selection
  filters.each(function (v, k) {
    if (v === 'All') {
      circles = circles
        .style('opacity', 1)
    } else {
      circles
        .filter(d => d[k] !== v)
        .style('opacity', 0)
      circles = circles
        .filter(d => d[k] === v)
        .style('opacity', 1)
    }
  })
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
    .attr('cx', function (d) { return new_xScale(d[xAttribute]) })
    .attr('cy', function (d) { return new_yScale(d[yAttribute]) });
}
