import { ConstantPool } from '@angular/compiler';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
//import { Component, OnInit } from '@angular/core';
import { clone, cloneDeep, get, isArray, isObject, isString } from 'lodash-es';
import mermaid from 'mermaid';
import { BaseBlockComponent } from '../base-block/base-block.component';
import { mappingUtility } from '../mapping-block/mapping-util';
import { SharedStateService } from 'src/app/services/shared-state.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { control } from 'leaflet';

@Component({
  selector: 'app-mermaid-block',
  templateUrl: './mermaid-block.component.html',
  styleUrls: ['./mermaid-block.component.scss']
})
export class MermaidBlockComponent extends BaseBlockComponent {

  mermaidConfig = {
    startOnLoad: false,
    flowchart: {
      htmlLabels: true,
      curve: 'basis'
    }
  }
  diagramType: string = "graph";
  diagramDirection: string = "TB";

  graphGetter = "data"; // where to look for the graph definition in the model
  graph = "";
  svg: SafeHtml; // allow the svg data through sanitizer
  svgId: "mermaid-svg";

  constructor(private stateService: SharedStateService, private sanitizer: DomSanitizer) {
    super()
    // Only render if we are looking for data within state
    this.stateService.state$.subscribe(state => {
      Promise.resolve(null).then(() => {
        if (this.graphGetter.startsWith("state")) {
          this.renderMermaid();
        }
      })
    });
  }


  ngAfterViewInit() {
    mermaid.initialize(this.mermaidConfig);    
  }

  onConfigUpdate(config: any) {
    this.graphGetter = get(config, 'graphGetter', 'data');
    this.diagramType = get(config, 'diagramType', 'graph');
    this.diagramDirection = get(config, 'diagramDirection', 'TB');
    this.svgId = get(config, 'svgId', 'mermaid-svg');    
    if (this.model) {
      // only attempt to render if data exists
      this.renderMermaid();
    }
  }


  onData(data: any, firstChange: boolean) {
    if (!firstChange) {      
      this.renderMermaid();
    }
    this.output.emit(clone(data));

  }

  /**
   * Generates the mermaid graph definition
   * @returns {string} the graph definition
   */
  getGraphDefinition() {
    let graphDefinition = this.diagramType + " " + this.diagramDirection + " \n";    
    let graph = mappingUtility({ data: this.model, context: this.context, state: this.stateService.state }, this.graphGetter);      
    // compile our graph from the data
    if (isArray(graph)) {      
      // if we have an array, just join it
      graphDefinition += graph.join("\n");
    } else if (isObject(graph)) {      
      // if we have an object, join the values
      graphDefinition += Object.values(graph).join("\n");
    } else {
      graphDefinition += graph+";\n";
    }    
    console.log(graphDefinition);
    return graphDefinition;
  }
  
  /** 
   * render the memmad graph 
   */
  renderMermaid() {
    const graphDefinition = this.getGraphDefinition();    
    if (graphDefinition) {
      mermaid.render(this.svgId, graphDefinition, (svgCode) => {
        this.svg = this.sanitizer.bypassSecurityTrustHtml(svgCode);
      });
    }
  }

}
