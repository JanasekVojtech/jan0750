import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileRenameDialogComponent } from './file-rename-dialog.component';

describe('FileRenameDialogComponent', () => {
  let component: FileRenameDialogComponent;
  let fixture: ComponentFixture<FileRenameDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FileRenameDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileRenameDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
