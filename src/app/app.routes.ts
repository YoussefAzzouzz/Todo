import { Routes } from '@angular/router';
import { TodoListComponent } from './todo-list/todo-list.component';

export const appRoutes: Routes = [
  { path: '', redirectTo: 'all', pathMatch: 'full', title: 'Todos' },
  { path: 'all', component: TodoListComponent, data: { filter: 'all' }, title: 'All todos' },
  { path: 'in-progress', component: TodoListComponent, data: { filter: 'in-progress' }, title: 'In-progress todos' },
  { path: 'done', component: TodoListComponent, data: { filter: 'done' }, title: 'Completed todos' },
  { path: '**', redirectTo: 'all' }
];
