import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalUserFormComponent } from './modal-user-form.component';

describe('ModalUserFormComponent', () => {
  let component: ModalUserFormComponent;
  let fixture: ComponentFixture<ModalUserFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalUserFormComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalUserFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
