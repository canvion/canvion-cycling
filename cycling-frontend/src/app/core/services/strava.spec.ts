import { TestBed } from '@angular/core/testing';

import { Strava } from './strava';

describe('Strava', () => {
  let service: Strava;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Strava);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
