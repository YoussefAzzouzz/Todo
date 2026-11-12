import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';

export type TodoStatus = 'in-progress' | 'done';

export interface Todo {
  id: number;
  title: string;
  status: TodoStatus;
}

interface JsonPlaceholderTodo {
  id: number;
  title: string;
  completed: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://jsonplaceholder.typicode.com/todos';
  private nextId = 1;

  readonly todos = signal<Todo[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    this.load();
  }

  add(title: string): void {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      return;
    }

    this.http.post<JsonPlaceholderTodo>(this.apiUrl, {
      title: trimmedTitle,
      completed: false,
      userId: 1
    }).subscribe({
      next: response => {
        this.todos.update(todos => [
          ...todos,
          {
            id: response.id || this.nextId++,
            title: trimmedTitle,
            status: 'in-progress'
          }
        ]);
      },
      error: error => this.setError(error, 'Impossible d’ajouter la tâche.')
    });
  }

  remove(id: number): void {
    this.http.delete<void>(`${this.apiUrl}/${id}`).subscribe({
      next: () => this.todos.update(todos => todos.filter(todo => todo.id !== id)),
      error: error => this.setError(error, 'Impossible de supprimer la tâche.')
    });
  }

  clearCompleted(): void {
    const completedTodos = this.todos().filter(todo => todo.status === 'done');
    if (completedTodos.length === 0) {
      return;
    }

    forkJoin(completedTodos.map(todo => this.http.delete<void>(`${this.apiUrl}/${todo.id}`)))
      .subscribe({
        next: () => this.todos.update(todos => todos.filter(todo => todo.status !== 'done')),
        error: error => this.setError(error, 'Impossible de supprimer les tâches terminées.')
      });
  }

  updateTitle(id: number, title: string): void {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      this.remove(id);
      return;
    }

    this.http.patch<JsonPlaceholderTodo>(`${this.apiUrl}/${id}`, { title: trimmedTitle })
      .subscribe({
        next: () => this.todos.update(todos => todos.map(todo =>
          todo.id === id ? { ...todo, title: trimmedTitle } : todo
        )),
        error: error => this.setError(error, 'Impossible de modifier la tâche.')
      });
  }

  toggleStatus(id: number): void {
    const todo = this.todos().find(item => item.id === id);
    if (!todo) {
      return;
    }

    const completed = todo.status !== 'done';
    this.http.patch<JsonPlaceholderTodo>(`${this.apiUrl}/${id}`, { completed })
      .subscribe({
        next: () => this.todos.update(todos => todos.map(item =>
          item.id === id
            ? { ...item, status: completed ? 'done' : 'in-progress' }
            : item
        )),
        error: error => this.setError(error, 'Impossible de changer le statut de la tâche.')
      });
  }

  private load(): void {
    this.http.get<JsonPlaceholderTodo[]>(`${this.apiUrl}?_limit=20`).subscribe({
      next: response => {
        const todos = response.map(todo => this.toTodo(todo));
        this.nextId = Math.max(0, ...todos.map(todo => todo.id)) + 1;
        this.todos.set(todos);
        this.loading.set(false);
      },
      error: error => {
        this.loading.set(false);
        this.setError(error, 'Impossible de charger les tâches.');
      }
    });
  }

  private toTodo(todo: JsonPlaceholderTodo): Todo {
    return {
      id: todo.id,
      title: todo.title,
      status: todo.completed ? 'done' : 'in-progress'
    };
  }

  private setError(error: unknown, fallbackMessage: string): void {
    const detail = error instanceof HttpErrorResponse && error.status
      ? ` (${error.status})`
      : '';
    this.error.set(`${fallbackMessage}${detail}`);
  }
}
