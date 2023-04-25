import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreksegDialogComponent } from './trekseg-dialog.component';

describe('TreksegDialogComponent', () => {
  let component: TreksegDialogComponent;
  let fixture: ComponentFixture<TreksegDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TreksegDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TreksegDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
