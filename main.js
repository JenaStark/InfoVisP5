var width = 600;
var height = 600;
var margin = {top: 20, left: 60, right: 30, bottom: 60};

var data, div, selectedCircle1, selectedCircle2;
var setFilters = d3.map();

window.onload = start;

function start() {
  // Define the div for the tooltip
  div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  d3.select('.close1')
    .on('click', function() {clearSelection('1')})

  d3.select('.close2')
    .on('click', function() {clearSelection('2')})

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
    // draw public/private legend
    drawLegend();
    // Draw default chart
    // Important to have this only be drawn after data is loaded so leave in this function
    actualDrawGraph('SAT Average', 'Average Cost');
    // user instructions
    alert('Welcome to CollegeVisualizer! \n\nUse the various charts and ' + 
      'compare colleges to find the perfect college for you.');
  });
}

function drawLegend() {
  svg = d3.select('#legend')
      .append('svg')
      .attr('width', 150)
      .attr('height', 30);
    svg.append("circle")
      .attr('fill', 'green')
      .attr("stroke", "black")
      .attr("cx",6)
      .attr("cy", 6)
      .attr("r", 5);
    svg.append('text')
      .text('= Private College')
      .attr("x", 14)
      .attr("y", 10);
    svg.append("circle")
      .attr('fill', 'orange')
      .attr("stroke", "black")
      .attr("cx",6)
      .attr("cy", 20)
      .attr("r", 5)
    svg.append('text')
      .text('= Public College')
      .attr("x", 14)
      .attr("y", 24);
}

function clearSelection(modalNumber) {
  // clear first details pane
  if (modalNumber == '1') {
    if (selectedCircle1) {
      selectedCircle1
        .attr('r', 5)
        .attr('fill', (d) => {
          if (d.Control == 'Public') {
            return "orange";
          }
          return "green";
        });
      d3.select('.modal1').style('display', 'none');
      selectedCircle1 = null;
    } 
  } else {
      // clear second details pane
      if (selectedCircle2) {
      selectedCircle2
        .attr('r', 5)
        .attr('fill', (d) => {
          if (d.Control == 'Public') {
            return "orange";
          }
          return "green";
        });
      d3.select('.modal2').style('display', 'none');
      selectedCircle2 = null;
      }
    }
}

function fillDetails(datapoint, i, modalNumber) {
  clearSelection(modalNumber);

  d3.selectAll('#details' + modalNumber + ' > *').remove()
  d3.select('.modal' + modalNumber)
    .style('display', 'inline-block')
  if (modalNumber == '1') {
    selectedCircle1 = chart.select(`[id='${i}'`)
    .attr('r', 10)
    .attr('fill', 'red')
    .raise()
  } else {
    selectedCircle2 = chart.select(`[id='${i}'`)
    .attr('r', 10)
    .attr('fill', 'red')
    .raise()
  }

  // Title
  d3.select('#details' + modalNumber)
    .append('h2')
    .text(datapoint['Name'])
  d3.select('#details' + modalNumber)
    .append('hr')
    .attr('class', 'style-three')
  // Content
  console.log(datapoint)
  var entries = d3.entries(datapoint);
  var enterSelection = d3.select('#details' + modalNumber).selectAll('div').data(entries).enter().filter(d => d.key != 'Name').append('div')
  enterSelection.insert('strong').text((d) => d.key + ':')
    .style('color', d => {
      if (d.key === xAttribute || d.key === yAttribute) {
        return 'red'
      }
      return 'black'
    });
  enterSelection.insert('span').text((d) => d.value)
    .style('color', d => {
      if (d.key === xAttribute || d.key === yAttribute) {
        return 'red'
      }
      return 'black'
    });
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
  xScale = d3.scaleLinear().domain(xExtent).range([margin.left, width - margin.right]);
  yScale = d3.scaleLinear().domain(yExtent).range([height - margin.bottom, margin.top]);

  xAxis = d3.axisBottom().scale(xScale);
  yAxis = d3.axisLeft().scale(yScale);

  // Remove old elements from chart
  d3.selectAll("#chart > *").remove();
  d3.selectAll('#details1 > *').remove()
  d3.selectAll('#details2 > *').remove()
  d3.selectAll('#filters > *').remove();
  clearSelection('1')
  clearSelection('2')

  // Add new svg
  chart = d3.select("#chart")
    .append('svg:svg')
    .attr("width", width)
    .attr("height", height);

  // Add a clipPath: everything out of this area won't be drawn. (helpful for zooming and panning)
  var clip = chart.append("defs").append("chart:clipPath")
    .attr("id", "clip")
    .append("chart:rect")
    .attr("width", width + 12 - margin.left - margin.right) // using scale ranges and their translation to calculate this
    .attr("height", height + 12 - margin.bottom - margin.top)
    .attr("x", margin.left - 6)
    .attr("y", margin.top - 6);

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
    .on("click", function (d, i) {
      fillDetails(d, i,'1');
    })
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
    .attr("transform", "translate(0," + (height - margin.bottom) + ")")
    .attr("class", "xaxis")
    .call(xAxis) // call the axis generator
    .append("text")
    .attr("class", "label")
    .attr("transform",
          "translate(" + ((width/2) + margin.right) + " ," + 
                         (margin.bottom/2) + ")")
    .style("text-anchor", "middle")
    .text(xLabel)
    .attr("font-weight", 700);

  // draw axis
  chart // or something else that selects the SVG element in your visualizations
    .append("g") // create a group node
    .attr("transform", "translate(" + margin.left + ", 0)")
    .attr("class", "yaxis")
    .call(yAxis)
  chart.append("text")
    .attr("class", "label")
    .attr("transform", "rotate(-90)")
    .attr("y", 0)
    .attr("x", 0 - (height / 2) + margin.bottom)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text(yLabel)
    .attr("font-weight", 700); // make bold

  chart.call(zoom);

  // FILTERS
  filters = d3.select('#filters')

  // College Selector
  filters.append('h3').text('Compare Colleges:');
  colleges = []
  colleges.push(...d3.set(cleanData, (d) => d.Name).values());

  filters
    .append('datalist')
    .attr('id', 'datalist')
    .selectAll('option')
    .data(colleges)
    .enter()
    .append('option')
        .text(d => d);

  // first college
  filters
    .append('div')
    .attr('id', 'CollegeSelector1')
    .append('strong')
    .text('#1: ')

  filters.select('#CollegeSelector1')
    .append('input')
    .attr('list', 'datalist')

  // second college
  filters
    .append('div')
    .attr('id', 'CollegeSelector2')
    .append('strong')
    .text('#2: ');

  filters.select('#CollegeSelector2')
    .append('input')
    .attr('list', 'datalist')

  filters
    .append('p')
    .append('button')
    .text('Compare Colleges')
    .on('click', () => {
      var collegeName1 = filters.select('#CollegeSelector1 input').property('value');
      var collegeName2 = filters.select('#CollegeSelector2 input').property('value');
      if (collegeName1 && collegeName2) {
        var college1 = chart.selectAll('circle').filter(d => d.Name === collegeName1);
        var college2 = chart.selectAll('circle').filter(d => d.Name === collegeName2);
        fillDetails(college1.data()[0], college1.attr('id'), '1')
        fillDetails(college2.data()[0], college2.attr('id'), '2')
      }
    })

  filters.append('h3').text('Filters: ');

  // Add public/private filtering
  controls = ['All', 'Public', 'Private']
  filters
    .append('div')
    .attr('id', 'ControlDiv')
    .text('Public/Private: ')
    .append('select')
    .attr('id', 'ControlFilter')
    .on('change', function () {
      setFilters.set("Control", this.value)
      filter(chart);
    })
    .selectAll('option')
    .data(controls)
    .enter()
    .append('option')
      .text(d => d)

  // Region filtering
  regions = ['All']
  regions.push(...d3.set(cleanData, (d) => d.Region).values())

  filters
    .append('div')
    .text('Region: ')
    .append('select')
    .attr('id', 'RegionFilter')
    .on('change', function () {
      setFilters.set("Region", this.value)
      filter(chart);
    })
    .selectAll('option')
    .data(regions)
    .enter()
    .append('option')
      .text(d => d)

  // SAT score
  scoreExtent = d3.extent(cleanData, (d) => d['SAT Average']);
  scoreHolder = filters.append('p').text('SAT Score: ')
  scoreHolder.append('strong')
    .text(scoreExtent[0])
  scoreHolder.append('input')
    .attr('min', scoreExtent[0])
    .attr('max', scoreExtent[1])
    .attr('id', 'scoreSlider')
    .attr('type', 'range')
    .on('input', function () {
      filters.select('#scoreVal')
        .property('value', this.value)
      setFilters.set('SAT Average', this.value)
      filter(chart)
    })
  scoreHolder.append('strong')
    .text(scoreExtent[1])
  scoreHolder.append('br')
  scoreHolder
    .append('input')
    .attr('type', 'number')
    .attr('id', 'scoreVal')
    .on('change', function () {
      filters.select('#scoreSlider')
        .property('value', this.value)
    })


  budgetExtent = d3.extent(cleanData, (d) => d['Average Cost']);
  budgetHolder = filters.append('p').text('Budget: ')
  budgetHolder.append('strong')
    .text(budgetExtent[0])
  budgetHolder.append('input')
    .attr('min', budgetExtent[0])
    .attr('max', budgetExtent[1])
    .attr('id', 'budgetSlider')
    .attr('type', 'range')
    .on('input', function () {
      filters.select('#budgetVal')
        .property('value', this.value)
      setFilters.set('Average Cost', this.value)
      filter(chart)
    })
  budgetHolder.append('strong')
    .text(budgetExtent[1])
  budgetHolder.append('br')
  budgetHolder.append('input')
    .attr('type', 'number')
    .attr('id', 'budgetVal')
    .on('input', function () {
      filters.select('#budgetSlider')
        .property('value', this.value)
    })

  // reset filters
  filters.append('p')
    .append('button')
    .text('Reset All Filters')
    .on('click', function () {
      // change filter selection text to 'All'
      document.getElementById('ControlFilter').value = 'All';
      document.getElementById('RegionFilter').value = 'All';
      document.getElementById('budgetSlider').value = null;
      document.getElementById('scoreSlider').value = null;
      document.getElementById('budgetVal').value = null;
      document.getElementById('scoreVal').value = null;

      // clear old filters and show all points
      setFilters = d3.map();
      chart.selectAll('circle')
        .transition()
        .duration(600)
        .style('opacity', 1)
    });

  
}

function filter(chart) {
  setTimeout(() => {
    circles = chart.selectAll('circle')
    // for each filter set go through and add each one to the selection
    setFilters.each(function (v, k) {
      if (v === 'All') {
        circles = circles
          .style('opacity', 1)
      } else {

        if (isNaN(v)) {
          circles
            .filter(d => d[k] !== v)
            .style('opacity', 0)
          circles = circles
            .filter(d => d[k] === v)
            .style('opacity', 1)
        } else {
          circles
            .filter(d => d[k] > v)
            .style('opacity', 0)
          circles
            .filter(d => d[k] <= v)
            .style('opacity', 1)
        }
      }
    })
  }, 200)
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
