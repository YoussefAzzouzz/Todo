import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

import { TodoService } from './todo.service';

describe('TodoService', () => {
  let service: TodoService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(TodoService);
    httpTesting = TestBed.inject(HttpTestingController);
    httpTesting.expectOne('https://jsonplaceholder.typicode.com/todos?_limit=20').flush([]);
  });

  afterEach(() => httpTesting.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
