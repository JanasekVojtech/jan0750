import { Component, OnInit,Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-move-to-gpx-dialog',
  templateUrl: './move-to-gpx-dialog.component.html',
  styleUrls: ['./move-to-gpx-dialog.component.css']
})
export class MoveToGpxDialogComponent implements OnInit {
  public chosenGPX:any
  constructor(@Inject(MAT_DIALOG_DATA)public data:any,
  private matDialogRef : MatDialogRef<MoveToGpxDialogComponent>,) { }

  ngOnInit(): void {}

  onSaveClick(){
    console.log(this.chosenGPX)
    this.matDialogRef.close(this.chosenGPX);
  }
  onCloseClick(){
    this.matDialogRef.close();
  }

}
