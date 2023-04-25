import { TestBed } from '@angular/core/testing';

import { EditMenuServiceService } from './edit-menu-service.service';

describe('EditMenuServiceService', () => {
  let service: EditMenuServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EditMenuServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
