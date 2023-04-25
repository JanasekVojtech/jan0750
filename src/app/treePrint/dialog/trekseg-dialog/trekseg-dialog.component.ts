import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ColorPickerService } from 'ngx-color-picker';
@Component({
  selector: 'app-trekseg-dialog',
  templateUrl: './trekseg-dialog.component.html',
  styleUrls: ['./trekseg-dialog.component.css']
})
export class TreksegDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA)public data:any,
              private matDialogRef : MatDialogRef<TreksegDialogComponent>,
              private cpService: ColorPickerService) { }

  ngOnInit(): void {}
  public onEventLog(event: string, data: any): void {
    console.log(event, data);
  }

  public onChangeColor(color: string): void {
    console.log('Color changed:', color);
  }

  onSaveClick(){
    this.matDialogRef.close(this.data);
  }
  onCloseClick(){
    this.matDialogRef.close();
  }
}
