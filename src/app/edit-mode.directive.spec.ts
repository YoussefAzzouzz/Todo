import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditModeDirective } from './edit-mode.directive';
import { Todo } from './todo.service';

@Component({
  standalone: true,
  imports: [EditModeDirective],
  template: '<div [appEditMode]="todo"></div>'
})
class TestHostComponent {
  readonly todo: Todo = { id: 1, title: 'Test task', status: 'in-progress' };
}

describe('EditModeDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent]
    });
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should create an instance', () => {
    expect(fixture.nativeElement.firstElementChild).toBeTruthy();
  });
});
