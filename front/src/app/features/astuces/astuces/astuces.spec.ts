import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Astuces } from './astuces';

describe('Astuces', () => {
  let component: Astuces;
  let fixture: ComponentFixture<Astuces>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Astuces],
    }).compileComponents();

    fixture = TestBed.createComponent(Astuces);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
