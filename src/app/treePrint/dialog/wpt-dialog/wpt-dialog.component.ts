import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import {iconsJson} from './icons.js';
@Component({
  selector: 'app-wpt-dialog',
  templateUrl: './wpt-dialog.component.html',
  styleUrls: ['./wpt-dialog.component.css']
})
export class WptDialogComponent implements OnInit {
  public chosenIcon:any
  public icon: Array<any> = []


  constructor(@Inject(MAT_DIALOG_DATA)public data:any,
              private matDialogRef : MatDialogRef<WptDialogComponent>) { }

  ngOnInit(): void { 
    for(let i=0;i<Object.keys(iconsJson).length;i++){
      this.icon.push({name: iconsJson[i].name, file:"../../assets/images/wtpIcons/" + iconsJson[i].fileName})
    }
  }
  

  onSaveClick(){
    console.log(this.chosenIcon)
    this.data.sym = this.chosenIcon
    console.log(this.data)
    this.matDialogRef.close(this.data);
  }
  onCloseClick(){
    this.matDialogRef.close();
  }
}
