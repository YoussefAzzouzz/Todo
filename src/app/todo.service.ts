import { Injectable, signal } from '@angular/core';

export type TodoStatus = 'in-progress' | 'done';

export interface Todo {
  id: number;
  title: string;
  status: TodoStatus;
}

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private nextId = 1;
  readonly todos = signal<Todo[]>([]);

  add(title: string): void {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      return;
    }

    this.todos.update(todos => [
      ...todos,
      { id: this.nextId++, title: trimmedTitle, status: 'in-progress' }
    ]);
  }

  remove(id: number): void {
    this.todos.update(todos => todos.filter(todo => todo.id !== id));
  }

  clearCompleted(): void {
    this.todos.update(todos => todos.filter(todo => todo.status !== 'done'));
  }

  updateTitle(id: number, title: string): void {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      this.remove(id);
      return;
    }

    this.todos.update(todos => todos.map(todo =>
      todo.id === id ? { ...todo, title: trimmedTitle } : todo
    ));
  }

  toggleStatus(id: number): void {
    this.todos.update(todos => todos.map(todo =>
      todo.id === id
        ? { ...todo, status: todo.status === 'done' ? 'in-progress' : 'done' }
        : todo
    ));
  }
}
