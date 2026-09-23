import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterPro } from './register-pro';

describe('RegisterPro', () => {
  let component: RegisterPro;
  let fixture: ComponentFixture<RegisterPro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterPro],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterPro);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
