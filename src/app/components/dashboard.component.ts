import { Component, signal } from '@angular/core';
import { TransactionFormComponent } from './transaction-form.component';
import { TransactionListComponent } from './transaction-list.component';
import { ReportComponent } from './report.component';
import { TranslatePipe } from '../core/pipes/translate.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [TransactionFormComponent, TransactionListComponent, ReportComponent, TranslatePipe],
  template: `
    <div class="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <!-- Header -->
      <header class="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16 items-center">
            <div class="flex items-center">
              <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white mr-3 shadow-sm">
                <i class="fa-solid fa-wallet"></i>
              </div>
              <h1 class="text-xl font-bold text-gray-900 tracking-tight">{{ 'app.title' | translate }}</h1>
            </div>
            
            <!-- Desktop Nav -->
            <nav class="hidden md:flex space-x-8">
              <button (click)="activeTab.set('dashboard')"
                      [class.text-blue-600]="activeTab() === 'dashboard'"
                      [class.border-blue-600]="activeTab() === 'dashboard'"
                      class="border-b-2 border-transparent hover:text-gray-900 px-1 py-5 text-sm font-medium transition-colors">
                <i class="fa-solid fa-house mr-2"></i>{{ 'nav.dashboard' | translate }}
              </button>
              <button (click)="activeTab.set('reports')"
                      [class.text-blue-600]="activeTab() === 'reports'"
                      [class.border-blue-600]="activeTab() === 'reports'"
                      class="border-b-2 border-transparent hover:text-gray-900 px-1 py-5 text-sm font-medium transition-colors">
                <i class="fa-solid fa-chart-pie mr-2"></i>{{ 'nav.reports' | translate }}
              </button>
            </nav>
            
            <!-- User Menu -->
            <div class="flex items-center">
              <button class="p-2 text-gray-400 hover:text-gray-500 bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center">
                <i class="fa-solid fa-user"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        @if (activeTab() === 'dashboard') {
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div class="lg:col-span-1">
              <app-transaction-form></app-transaction-form>
            </div>
            <div class="lg:col-span-2">
              <app-transaction-list></app-transaction-list>
            </div>
          </div>
        } @else {
          <app-report></app-report>
        }
      </main>

      <!-- Mobile Bottom Nav -->
      <div class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 z-40 pb-safe">
        <button (click)="activeTab.set('dashboard')"
                [class.text-blue-600]="activeTab() === 'dashboard'"
                class="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-gray-900 transition-colors">
          <i class="fa-solid fa-house mb-1 text-lg"></i>
          <span class="text-[10px] font-medium uppercase tracking-wide">{{ 'nav.dashboard' | translate }}</span>
        </button>
        <button (click)="activeTab.set('reports')"
                [class.text-blue-600]="activeTab() === 'reports'"
                class="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-gray-900 transition-colors">
          <i class="fa-solid fa-chart-pie mb-1 text-lg"></i>
          <span class="text-[10px] font-medium uppercase tracking-wide">{{ 'nav.reports' | translate }}</span>
        </button>
      </div>
    </div>
  `
})
export class DashboardComponent {
  activeTab = signal<'dashboard' | 'reports'>('dashboard');
}
