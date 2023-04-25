import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoveToGpxDialogComponent } from './move-to-gpx-dialog.component';

describe('MoveToGpxDialogComponent', () => {
  let component: MoveToGpxDialogComponent;
  let fixture: ComponentFixture<MoveToGpxDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MoveToGpxDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MoveToGpxDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
