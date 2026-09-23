import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfessionnelDetail } from './professionnel-detail';

describe('ProfessionnelDetail', () => {
  let component: ProfessionnelDetail;
  let fixture: ComponentFixture<ProfessionnelDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfessionnelDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfessionnelDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
