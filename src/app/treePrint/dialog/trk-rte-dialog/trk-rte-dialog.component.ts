import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { TreksegDialogComponent } from '../../dialog/trekseg-dialog/trekseg-dialog.component';
import { ColorPickerService } from 'ngx-color-picker';

@Component({
  selector: 'app-trk-rte-dialog',
  templateUrl: './trk-rte-dialog.component.html',
  styleUrls: ['./trk-rte-dialog.component.css']
})
export class TrkRteDialogComponent implements OnInit {
  
  constructor(@Inject(MAT_DIALOG_DATA)public data:any,
              private matDialogRef : MatDialogRef<TrkRteDialogComponent>,
              private matDialog : MatDialog,
              private cpService: ColorPickerService) { }

  ngOnInit(): void {}
 
  onSaveClick(){
    this.matDialogRef.close(this.data);
  }
  onCloseClick(){
    this.matDialogRef.close();
  }
  public onEventLog(event: string, data: any): void {
    console.log(event, data);
  }

  public onChangeColor(color: string): void {
    console.log('Color changed:', color);
  }


  showTrkseg(element:any){
    let dialogRef1 = this.matDialog.open(TreksegDialogComponent, 
      {
        data: JSON.parse(JSON.stringify(element)),
        disableClose: true
    });

    dialogRef1.afterClosed().subscribe(
      result =>{
        if(result != undefined){
          console.log(result);
          Object.assign(element, result);
        }
        
       

      }
    )
  }
}
