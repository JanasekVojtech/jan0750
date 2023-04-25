import { Component, Input, OnInit } from '@angular/core';
import { TreeMenuServiceService } from './tree-menu-service.service';
import { TreeComponent} from '../../tree/tree.component';
import {GpxNode} from '../../gpx-node';
@Component({
  selector: 'app-tree-menu',
  templateUrl: './tree-menu.component.html',
  styleUrls: ['./tree-menu.component.css']
})
export class TreeMenuComponent  {
  @Input()node!:GpxNode;  
  constructor(
              private treeMenuServiceService: TreeMenuServiceService,
              public treeComponent:TreeComponent
              ){}

 showTrack(){
    this.treeComponent.showFullGpx(this.node, true);
  }

  delete(){
    this.treeMenuServiceService.delete(this.node)
    this.treeComponent.delete(this.node.id);
  }
  async save(){
    
    if(this.node.parsed == false){
      console.log("saving not parsed obj", this.node)
      await this.treeComponent.parseWholeFile(this.node.id)
      this.node = this.treeComponent.returnNodebyID(this.node.id)
      
    }
    this.treeMenuServiceService.save(this.node)
  }

   async rename(){
    console.log(this.node)
    if(this.node.parsed == false){
      console.log(this.node)
      await this.treeComponent.parseWholeFile(this.node.id)
      this.node = this.treeComponent.returnNodebyID(this.node.id)
      
    }
    this.treeMenuServiceService.rename(this.node)
    this.treeComponent.refresh();
  }

  async downloadFile(){
    console.log(this.node)
    if(this.node.parsed == false){
      console.log(this.node)
      await this.treeComponent.parseWholeFile(this.node.id)
      this.node = this.treeComponent.returnNodebyID(this.node.id)
      
    }
    this.treeMenuServiceService.download(this.node)
    this.treeComponent.refresh();
  }

}
