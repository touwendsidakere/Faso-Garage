import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NumerosUtiles } from './numeros-utiles';

describe('NumerosUtiles', () => {
  let component: NumerosUtiles;
  let fixture: ComponentFixture<NumerosUtiles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NumerosUtiles],
    }).compileComponents();

    fixture = TestBed.createComponent(NumerosUtiles);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
