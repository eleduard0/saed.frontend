import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaestrosAlumnoComponent } from './maestros-alumno.component';

describe('MaestrosAlumnoComponent', () => {
  let component: MaestrosAlumnoComponent;
  let fixture: ComponentFixture<MaestrosAlumnoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaestrosAlumnoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MaestrosAlumnoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
