import { Component, inject } from '@angular/core';
import { TransactionService } from '../core/services/transaction.service';
import { TranslatePipe } from '../core/pipes/translate.pipe';
import { DatePipe, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [TranslatePipe, DatePipe, CurrencyPipe],
  template: `
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h2 class="text-lg font-semibold text-gray-800">{{ 'list.title' | translate }}</h2>
      </div>
      
      <div class="divide-y divide-gray-100">
        @for (t of transactionService.transactions(); track t.id) {
          <div class="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                   [class.bg-red-100]="t.type === 'expense'"
                   [class.text-red-600]="t.type === 'expense'"
                   [class.bg-green-100]="t.type === 'income'"
                   [class.text-green-600]="t.type === 'income'">
                <i class="fa-solid" [class]="getIconForCategory(t.category)"></i>
              </div>
              
              <div>
                <p class="font-medium text-gray-800">{{ getCategoryName(t.category) | translate }}</p>
                <div class="flex items-center text-sm text-gray-500 mt-0.5">
                  <span>{{ t.date | date:'MMM d, y, h:mm a' }}</span>
                  @if (t.remark) {
                    <span class="mx-2">•</span>
                    <span class="truncate max-w-[120px] sm:max-w-[200px]">{{ t.remark }}</span>
                  }
                </div>
              </div>
            </div>
            
            <div class="flex items-center space-x-4">
              <div class="text-right">
                <p class="font-semibold"
                   [class.text-red-600]="t.type === 'expense'"
                   [class.text-green-600]="t.type === 'income'">
                  {{ t.type === 'expense' ? '-' : '+' }}{{ t.amount | currency }}
                </p>
              </div>
              
              <button (click)="transactionService.deleteTransaction(t.id)" 
                      class="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-2 rounded-lg hover:bg-red-50">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>
        } @empty {
          <div class="p-12 text-center text-gray-500">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl text-gray-400">
              <i class="fa-solid fa-receipt"></i>
            </div>
            <p>{{ 'list.empty' | translate }}</p>
          </div>
        }
      </div>
    </div>
  `
})
export class TransactionListComponent {
  transactionService = inject(TransactionService);

  getIconForCategory(category: string): string {
    const icons: Record<string, string> = {
      food: 'fa-utensils',
      transport: 'fa-car',
      shopping: 'fa-bag-shopping',
      bills: 'fa-file-invoice-dollar',
      entertainment: 'fa-film',
      salary: 'fa-money-bill-wave',
      other: 'fa-box'
    };
    return icons[category] || 'fa-tag';
  }

  getCategoryName(category: string): string {
    const predefined = ['food', 'transport', 'shopping', 'bills', 'entertainment', 'salary', 'other'];
    if (predefined.includes(category)) {
      return `categories.${category}`;
    }
    return category; // Custom category
  }
}
