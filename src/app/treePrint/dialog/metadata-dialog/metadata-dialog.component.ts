import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-metadata-dialog',
  templateUrl: './metadata-dialog.component.html',
  styleUrls: ['./metadata-dialog.component.css']
})
export class MetadataDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA)public data:any,
              private matDialogRef : MatDialogRef<MetadataDialogComponent>) { }

  ngOnInit(): void {}

  onSaveClick(){
    this.matDialogRef.close(this.data);
  }
  onCloseClick(){
    this.matDialogRef.close();
  }

}
