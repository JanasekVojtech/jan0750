import { Injectable, OnInit } from '@angular/core';
import { WptDialogComponent } from '../../dialog/wpt-dialog/wpt-dialog.component';
import { MetadataDialogComponent } from '../../dialog/metadata-dialog/metadata-dialog.component';
import { TrkRteDialogComponent } from '../../dialog/trk-rte-dialog/trk-rte-dialog.component';
import { TreksegDialogComponent } from '../../dialog/trekseg-dialog/trekseg-dialog.component';
import { MatDialog } from '@angular/material/dialog';
//import { TreeComponent} from '../../tree/tree.component';
import { LoadGPXService} from '../../../load_gpx/load-gpx.service';
@Injectable({
  providedIn: 'root'
})
export class EditMenuServiceService  {

  constructor(private matDialog : MatDialog,
    //public treeComponent:TreeComponent,
    private loadGPXService:LoadGPXService) {
      this.loadGPXService.editObj.subscribe((editedObj: any)=> {this.editByDblClick(editedObj)} );  
    }
  
 
    
     
  

  editByDblClick(editedObj:any){
    if(editedObj){
      this.editTree(editedObj)
    } 
  }

   
  
  editTree(data:any){
    console.log(data)
    if(data.type == "wtp"){
      //console.log(data.time)
      if(data.obj.time != undefined){
        data.obj.time = new Date(data.obj.time ).toISOString().slice(0, 16);
      }
     
      let dialogRef1 = this.matDialog.open(WptDialogComponent, 
        {
          data: JSON.parse(JSON.stringify(data.obj)),
          disableClose: true
      });
  
      dialogRef1.afterClosed().subscribe(
        result =>{
          if(result != undefined){
            console.log(result);
            Object.assign(data.obj, result);
            this.loadGPXService.refreshVisibleGpx()
            
          }
          
         

        }
      )
    }

    if(data.type == "metadata"){
      let tempObj = JSON.parse(JSON.stringify(data.obj))
      if(tempObj.link == undefined){
        tempObj.link = [{$: {}}];
      }
      if(tempObj.author == undefined){
        tempObj.author = {link:{$: {}}, }
        if(tempObj.author.link == undefined){

        }
      }
      if(tempObj.copyright == undefined){
        tempObj.copyright = {};
      }
      
      let dialogRef2 = this.matDialog.open(MetadataDialogComponent, 
        {
          data: tempObj,
          disableClose: true
      });
  
      dialogRef2.afterClosed().subscribe(
        result =>{
          if(result != undefined){
            console.log(result);
            Object.assign(data.obj, result);
            this.loadGPXService.refreshVisibleGpx()
          }
          
        }
      )
    }
    
    if(data.type == "rte" || data.type == "trk"){
      let tempObj = JSON.parse(JSON.stringify(data.obj))
      if(tempObj.link == undefined){
        tempObj.link = [{$: {}}];
      }
      if(tempObj.extensions == undefined){
        if( data.type == "rte"){
          tempObj.extensions = {'gpxx:RouteExtension':{'gpxx:DisplayColor':'#3388ff'}}
        }
        
      }
      let dialogRef3 = this.matDialog.open(TrkRteDialogComponent, 
        {
          data: tempObj,
          disableClose: true
      });
  
      dialogRef3.afterClosed().subscribe(
        result =>{
          if(result != undefined){
            console.log(result);
            Object.assign(data.obj, result);
            //this.treeComponent.refresh();
            this.loadGPXService.refreshVisibleGpx()
            
          }
          
        }
      )
    }
    if(data.type == "trkseg"){
      let tempObj = JSON.parse(JSON.stringify(data.obj))
      if(tempObj.extensions == undefined){
        tempObj.extensions = {'gpxx:TrackExtension':{'gpxx:DisplayColor':'#3388ff'}}
      }
      
      let dialogRef1 = this.matDialog.open(TreksegDialogComponent, 
        {
          data: tempObj,
          disableClose: true
      });
  
      dialogRef1.afterClosed().subscribe(
        result =>{
          if(result != undefined){
            console.log(result);
            Object.assign(data.obj, result);
            this.loadGPXService.refreshVisibleGpx()
          }
          
         

        }
      )
    }
    this.loadGPXService.refreshVisibleGpx()
  }


  

}
