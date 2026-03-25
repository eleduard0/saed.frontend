import { TestBed } from '@angular/core/testing';

import { ConsultaDeMaestroService } from './consulta-de-maestro.service';

describe('ConsultaDeMaestroService', () => {
  let service: ConsultaDeMaestroService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConsultaDeMaestroService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
