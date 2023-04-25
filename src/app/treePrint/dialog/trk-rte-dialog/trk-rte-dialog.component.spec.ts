import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrkRteDialogComponent } from './trk-rte-dialog.component';

describe('TrkRteDialogComponent', () => {
  let component: TrkRteDialogComponent;
  let fixture: ComponentFixture<TrkRteDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrkRteDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TrkRteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
