import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilProEdit } from './profil-pro-edit';

describe('ProfilProEdit', () => {
  let component: ProfilProEdit;
  let fixture: ComponentFixture<ProfilProEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfilProEdit],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilProEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
