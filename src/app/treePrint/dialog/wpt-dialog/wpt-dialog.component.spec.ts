import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WptDialogComponent } from './wpt-dialog.component';

describe('WptDialogComponent', () => {
  let component: WptDialogComponent;
  let fixture: ComponentFixture<WptDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WptDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WptDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
