import { Component, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { Todo, TodoService, TodoStatus } from '../todo.service';
import { EditModeDirective } from '../edit-mode.directive';

type TodoFilter = 'all' | TodoStatus;

@Component({
    selector: 'app-todo-list',
    templateUrl: './todo-list.component.html',
    styleUrls: ['./todo-list.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [FormsModule, RouterLink, EditModeDirective]
})
export class TodoListComponent {
  private readonly todoService = inject(TodoService);
  private readonly route = inject(ActivatedRoute);

  readonly currentFilter = toSignal(
    this.route.data.pipe(
      map(data => (data['filter'] as TodoFilter | undefined) ?? 'all')
    ),
    { initialValue: 'all' as TodoFilter }
  );
  readonly filteredTodos = computed(() => {
    const todos = this.todoService.todos();
    const filter = this.currentFilter();
    return filter === 'all' ? todos : todos.filter(todo => todo.status === filter);
  });
  readonly activeCount = computed(() =>
    this.todoService.todos().filter(todo => todo.status === 'in-progress').length
  );
  readonly filters: ReadonlyArray<{ label: string; path: string; value: TodoFilter }> = [
    { label: 'All', path: '/all', value: 'all' },
    { label: 'In progress', path: '/in-progress', value: 'in-progress' },
    { label: 'Done', path: '/done', value: 'done' }
  ];

  newTask = '';
  editingId: number | null = null;
  editTitle = '';

  addTask(): void {
    this.todoService.add(this.newTask);
    this.newTask = '';
  }

  deleteTask(id: number): void {
    this.todoService.remove(id);
    if (this.editingId === id) {
      this.cancelEdit();
    }
  }

  clearCompleted(): void {
    this.todoService.clearCompleted();
  }

  toggleTask(id: number): void {
    this.todoService.toggleStatus(id);
  }

  startEdit(todo: Todo): void {
    this.editingId = todo.id;
    this.editTitle = todo.title;
  }

  finishEdit(todo: Todo): void {
    if (this.editingId !== todo.id) {
      return;
    }

    this.todoService.updateTitle(todo.id, this.editTitle);
    this.cancelEdit();
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editTitle = '';
  }
}
