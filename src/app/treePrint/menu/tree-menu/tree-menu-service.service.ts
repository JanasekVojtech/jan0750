import { Injectable } from '@angular/core';
import { FileRenameDialogComponent } from '../../dialog/file-rename-dialog/file-rename-dialog.component';
import { LoadGPXService} from '../../../load_gpx/load-gpx.service';

import { MatDialog } from '@angular/material/dialog';
@Injectable({
  providedIn: 'root'
})
export class TreeMenuServiceService {
  
  constructor( private matDialog : MatDialog,
              public LocalStorage:LoadGPXService) { 
                this.LocalStorage.renameFile.subscribe((newNode: any)=> {this.renameNewFile(newNode)} );  
              }


  renameNewFile(node:any){
    if(node != null){
      if(node.name == null){
        node.name = "default Name"
      }
      let dialogRef1 = this.matDialog.open(FileRenameDialogComponent, 
        {
          data: JSON.parse(JSON.stringify(node.name)),
          disableClose: true
      });

      dialogRef1.afterClosed().subscribe(
        result =>{
          if(result != undefined){
            console.log(result);
            node.name = result;
            
            console.log(node);
            this.LocalStorage.saveToDb(node)
          }
        }
      )
      
      
    }  
  }

  delete(node:any){
    this.LocalStorage.delete(node.id);
  }
  save(node:any){
    this.LocalStorage.saveToExistingDb(node);
  }

  rename(node:any){
   // console.log(node)
      if(node.name == null){
            node.name = "default Name"
          }
          let dialogRef1 = this.matDialog.open(FileRenameDialogComponent, 
            {
              data: JSON.parse(JSON.stringify(node.name)),
              disableClose: true
          });

          dialogRef1.afterClosed().subscribe(
            result =>{
              if(result != undefined){
                console.log(result);
                node.name = result;
                
                console.log(node);
              }
            }
          )
    
  }

  download(node:any){
    //console.log(node, "nodePrint")
    this.LocalStorage.downloadFileByID(node.id, node.name);
  }

}
