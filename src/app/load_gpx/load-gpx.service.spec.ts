import { TestBed } from '@angular/core/testing';

import { LoadGPXService } from './load-gpx.service';

describe('LoadGPXService', () => {
  let service: LoadGPXService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadGPXService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
