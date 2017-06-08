import { Component, OnInit, OnChanges, ViewChild, ElementRef, Input, ViewEncapsulation } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-barchart',
  templateUrl: './barchart.component.html',
  styleUrls: ['./barchart.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class BarchartComponent implements OnInit, OnChanges {
  @ViewChild('chart') private chartContainer: ElementRef;
  @Input() private data: Array<any>;
  private margin: any = { top: 20, bottom: 30, left: 20, right: 20};
  private colors = ['#0000b4','#0082ca','#0094ff','#0d4bcf','#0066AE','#074285','#00187B','#285964','#405F83','#416545','#4D7069','#6E9985','#7EBC89','#0283AF','#79BCBF','#99C19E'];
  private chart: any;
  private width: number;
  private height: number;
  private xScale: any;
  private yScale: any;
  private colorScale: any;
  private xAxis: any;
  private yAxis: any;
  private horizontal: boolean = true;

  constructor() { }

  ngOnInit() {
    this.createChart();
    if (this.data) {
      this.updateChart();
    }
  }

  ngOnChanges() {
    if (this.chart) {
      this.updateChart();
    }
  }
  
  adjustLeftMargin() {
	  var strs: Array<any>;
	  if (this.horizontal) {
		  strs = this.data.map(d => d[0]);
	  } else {
		  var maxL:number = d3.max(this.data, d => d[1]);
		  strs = new Array<any>();
		  strs.push(maxL.toString());
	  }
	  var len:number = d3.max(strs, d => d.toString().length);
	  this.margin.left = len * 5 + 30;
  }
  
  createChart() {
	this.adjustLeftMargin();
    let element = this.chartContainer.nativeElement;
    this.width = element.offsetWidth - this.margin.left - this.margin.right;
    this.height = element.offsetHeight - this.margin.top - this.margin.bottom;
    let svg = d3.select(element).append('svg')
      .attr('width', element.offsetWidth)
      .attr('height', element.offsetHeight);

    // chart plot area
    this.chart = svg.append('g')
      .attr('class', 'bars')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

    // define X & Y domains
    let nameDomain = this.data.map(d => d[0]);
    let valueDomain = [0, d3.max(this.data, d => d[1])];

	if (this.horizontal) {
		// create scales
		this.xScale = d3.scaleLinear().domain(valueDomain).range([0, this.width]);
		this.yScale = d3.scaleBand().padding(0.1).domain(nameDomain).rangeRound([this.height, 0]);
	} else {
		// create scales
		this.xScale = d3.scaleBand().padding(0.1).domain(nameDomain).rangeRound([0, this.width]);
		this.yScale = d3.scaleLinear().domain(valueDomain).range([this.height, 0]);	
	}

	// bar colorScale		
	this.colorScale = d3.scaleOrdinal().range(this.colors);

	// x & y axis
	this.xAxis = svg.append('g')
	  .attr('class', 'axis axis-x')
	  .attr('transform', `translate(${this.margin.left}, ${this.margin.top + this.height})`)
	  .call(d3.axisBottom(this.xScale));
	this.yAxis = svg.append('g')
	  .attr('class', 'axis axis-y')
	  .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`)
	  .call(d3.axisLeft(this.yScale));
  }

  updateChart() {
	this.adjustLeftMargin();
    // define X & Y domains
    let nameDomain = this.data.map(d => d[0]);
    let valueDomain = [0, d3.max(this.data, d => d[1])];
	
	if (this.horizontal) {
		
		// update scales & axis
		this.xScale.domain(valueDomain);
		this.yScale.domain(nameDomain);
		this.colorScale.domain([0, this.data.length]);
		this.xAxis.transition().call(d3.axisBottom(this.xScale));
		this.yAxis.transition().call(d3.axisLeft(this.yScale));

		let update = this.chart.selectAll('.bar')
		  .data(this.data);

		// remove exiting bars
		update.exit().remove();

		// update existing bars
		this.chart.selectAll('.bar').transition()
		  .attr('x', d => 0)
		  .attr('y', d => this.yScale(d[0]))
		  .attr('width', d => this.xScale(d[1]))
		  .attr('height', d => this.yScale.bandwidth())
		  .style('fill', (d, i) => this.colorScale(i));

		// add new bars
		update
		  .enter()
		  .append('rect')
		  .attr('class', 'bar')
		  .attr('x', 0)
		  .attr('y', d => this.yScale(d[0]))
		  .attr('width', 0)
		  .attr('height', this.yScale.bandwidth())
		  .style('fill', (d, i) => this.colorScale(i))
		  .transition()
		  .delay((d, i) => i * 10)
		  .attr('x', 0)
		  .attr('width', d => this.xScale(d[1]));
	} else {
		// update scales & axis
		this.xScale.domain(nameDomain);
		this.yScale.domain(valueDomain);
		this.colorScale.domain([0, this.data.length]);
		this.xAxis.transition().call(d3.axisBottom(this.xScale));
		this.yAxis.transition().call(d3.axisLeft(this.yScale));

		let update = this.chart.selectAll('.bar')
		  .data(this.data);

		// remove exiting bars
		update.exit().remove();

		// update existing bars
		this.chart.selectAll('.bar').transition()
		  .attr('x', d => this.xScale(d[0]))
		  .attr('y', d => this.yScale(d[1]))
		  .attr('width', d => this.xScale.bandwidth())
		  .attr('height', d => this.height - this.yScale(d[1]))
		  .style('fill', (d, i) => this.colorScale(i));

		// add new bars
		update
		  .enter()
		  .append('rect')
		  .attr('class', 'bar')
		  .attr('x', d => this.xScale(d[0]))
		  .attr('y', d => this.yScale(0))
		  .attr('width', this.xScale.bandwidth())
		  .attr('height', 0)
		  .style('fill', (d, i) => this.colorScale(i))
		  .transition()
		  .delay((d, i) => i * 10)
		  .attr('y', d => this.yScale(d[1]))
		  .attr('height', d => this.height - this.yScale(d[1]));
	}
  }
}
