import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-file-rename-dialog',
  templateUrl: './file-rename-dialog.component.html',
  styleUrls: ['./file-rename-dialog.component.css']
})
export class FileRenameDialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA)public data:any,
  private matDialogRef : MatDialogRef<FileRenameDialogComponent>) { }

  ngOnInit(): void {
  }
  onSaveClick(){
    this.matDialogRef.close(this.data);
  }
  onCloseClick(){
    this.matDialogRef.close();
  }

}
