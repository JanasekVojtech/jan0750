import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TreeComponent} from '../../tree/tree.component';

import { EditMenuServiceService} from '../edit-menu/edit-menu-service.service';
@Component({
  selector: 'app-edit-menu',
  templateUrl: './edit-menu.component.html',
  styleUrls: ['./edit-menu.component.css']
})
export class EditMenuComponent   {
  
  @Input()data:any; 
  constructor(private matDialog : MatDialog,
              public treeComponent:TreeComponent, 
              private editMenuServiceService:EditMenuServiceService) { }
  
 
    
  
  edit(){
    this.editMenuServiceService.editTree(this.data)
  }
  delete(){
    if(this.data.type == "wtp"){
      this.treeComponent.deleteWtpByObj(this.data.obj)
    }
    if(this.data.type == "rte"){
      this.treeComponent.deleteRteByObj(this.data.obj)
    }
    if(this.data.type == "trk"){
      this.treeComponent.deleteTrkByObj(this.data.obj)
    }
    if(this.data.type == "trkseg"){
      this.treeComponent.deleteTrksegByObj(this.data.obj)
    }
    if(this.data.type == "metadata"){
      this.treeComponent.deleteMetadataByObj(this.data.obj)
    }
  }



}

