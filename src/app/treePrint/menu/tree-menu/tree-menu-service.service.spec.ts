import { TestBed } from '@angular/core/testing';

import { TreeMenuServiceService } from './tree-menu-service.service';

describe('TreeMenuServiceService', () => {
  let service: TreeMenuServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TreeMenuServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
