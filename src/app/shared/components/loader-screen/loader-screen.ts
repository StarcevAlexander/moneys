import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-loader-screen',
  imports: [],
  templateUrl: './loader-screen.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './loader-screen.scss',
})
export class LoaderScreen {
  readonly label = input('Загрузка…');
  readonly hint = input<string | undefined>(undefined);
}
