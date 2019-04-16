import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayCComponent } from './display-c.component';

describe('DisplayCComponent', () => {
  let component: DisplayCComponent;
  let fixture: ComponentFixture<DisplayCComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisplayCComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayCComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
