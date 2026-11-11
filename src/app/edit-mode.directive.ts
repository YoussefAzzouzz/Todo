import {
  DestroyRef,
  Directive,
  ElementRef,
  Renderer2,
  inject,
  input,
  output
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent, merge } from 'rxjs';
import { filter, tap } from 'rxjs/operators';
import { Todo } from './todo.service';

@Directive({
  selector: '[appEditMode]',
  standalone: true
})
export class EditModeDirective {
  readonly todo = input.required<Todo>({ alias: 'appEditMode' });
  readonly editModeChange = output<boolean>();

  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    const doubleClick$ = fromEvent<MouseEvent>(
      this.elementRef.nativeElement,
      'dblclick'
    ).pipe(
      filter(event => {
        const target = event.target;
        return target instanceof Node &&
          !target.parentElement?.closest('button, input');
      }),
      tap(() => {
        this.renderer.addClass(this.elementRef.nativeElement, 'editing');
        this.editModeChange.emit(true);
      })
    );

    const enterKey$ = fromEvent<KeyboardEvent>(
      this.elementRef.nativeElement,
      'keyup'
    ).pipe(
      filter(event => event.key === 'Enter' || event.key === 'Escape'),
      tap(() => {
        this.renderer.removeClass(this.elementRef.nativeElement, 'editing');
        this.editModeChange.emit(false);
      })
    );

    merge(doubleClick$, enterKey$)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }
}
