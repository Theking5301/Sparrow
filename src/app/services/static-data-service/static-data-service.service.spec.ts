import { TestBed } from '@angular/core/testing';
import { StaticDataService } from './static-data-service.service';


describe('StaticDataServiceService', () => {
  let service: StaticDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StaticDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
