import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-tutorial-dialog',
  templateUrl: './tutorial-dialog.component.html',
  styleUrls: ['./tutorial-dialog.component.css']
})
export class TutorialDialogComponent implements OnInit {

  constructor(private matDialogRef : MatDialogRef<TutorialDialogComponent>) { }

  ngOnInit(): void {
  }

  onCloseClick(){
    this.matDialogRef.close();
  }

}
