import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import * as d3 from 'd3';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {
  ngOnInit() {
    console.log('D3.js version:', d3['version']);

    this.loadForceDirectedGraph();
  }

  loadForceDirectedGraph() {
    const svg = d3.select('svg');
    const width = +svg.attr('width');
    const height = +svg.attr('height');
    const color = d3.scaleOrdinal(d3.schemeCategory20);

    const simulation = d3.forceSimulation()
      .force('link', d3.forceLink().id((d) => d['id']))
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter(width / 2, height / 2));

    d3.json('assets/miserables.json', (err, data) => {
      if (err) { throw new Error('Bad data file!'); }

      const link = svg.append('g')
        .attr('class', 'links')
        .selectAll('line')
        .data(data['links'])
        .enter()
        .append('line')
        .attr('stroke-width', (d) => Math.sqrt(d['value']));

      const node = svg.append('g')
        .attr('class', 'nodes')
        .selectAll('circle')
        .data(data['nodes'])
        .enter()
        .append('circle')
        .attr('r', 5)
        .attr('fill', (d) => color(d['group']))
        .call(d3.drag()
          .on('start', dragStarted)
          .on('drag', dragged)
          .on('end', dragEnded)
        );

      node.append('title')
        .text((d) => d['id']);

      simulation
        .nodes(data['nodes'])
        .on('tick', ticked);

      simulation.force<d3.ForceLink<any, any>>('link')
        .links(data['links']);

      function ticked() {
        link
          .attr('x1', function(d) { return d['source'].x; })
          .attr('y1', function(d) { return d['source'].y; })
          .attr('x2', function(d) { return d['target'].x; })
          .attr('y2', function(d) { return d['target'].y; });

      node
        .attr('cx', function(d) { return d['x']; })
        .attr('cy', function(d) { return d['y']; });
      }
    });

    function dragStarted(d) {
      if (!d3.event.active) { simulation.alphaTarget(0.3).restart(); }
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragEnded(d) {
      if (!d3.event.active) { simulation.alphaTarget(0); }
      d.fx = null;
      d.fy = null;
    }
  }
}
