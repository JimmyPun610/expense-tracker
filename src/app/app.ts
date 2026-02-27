import {ChangeDetectionStrategy, Component} from '@angular/core';
import {DashboardComponent} from './components/dashboard.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [DashboardComponent],
  template: `<app-dashboard></app-dashboard>`,
})
export class App {}
