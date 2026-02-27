import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TransactionService } from '../core/services/transaction.service';
import { OcrService } from '../core/services/ocr.service';
import { TranslationService } from '../core/services/translation.service';
import { TranslatePipe } from '../core/pipes/translate.pipe';
import { CalculatorComponent } from './calculator.component';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, CalculatorComponent],
  template: `
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold text-gray-800">New Transaction</h2>
        <button type="button" (click)="fileInput.click()" [disabled]="isScanning()"
                class="text-sm text-blue-600 font-medium hover:text-blue-700 disabled:opacity-50 flex items-center bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
          @if (isScanning()) {
            <i class="fa-solid fa-spinner fa-spin mr-2"></i> {{ 'form.scanning' | translate }}
          } @else {
            <i class="fa-solid fa-camera mr-2"></i> {{ 'form.scan_receipt' | translate }}
          }
        </button>
        <input type="file" #fileInput accept="image/*" class="hidden" (change)="onFileSelected($event)">
      </div>
      
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">
        
        <!-- Type Selection -->
        <div class="flex p-1 bg-gray-100 rounded-xl">
          <button type="button" 
                  (click)="setType('expense')"
                  [class.bg-white]="form.get('type')?.value === 'expense'"
                  [class.shadow-sm]="form.get('type')?.value === 'expense'"
                  [class.text-red-600]="form.get('type')?.value === 'expense'"
                  class="flex-1 py-2 rounded-lg text-sm font-medium text-gray-500 transition-all">
            <i class="fa-solid fa-arrow-down mr-2"></i>{{ 'form.expense' | translate }}
          </button>
          <button type="button" 
                  (click)="setType('income')"
                  [class.bg-white]="form.get('type')?.value === 'income'"
                  [class.shadow-sm]="form.get('type')?.value === 'income'"
                  [class.text-green-600]="form.get('type')?.value === 'income'"
                  class="flex-1 py-2 rounded-lg text-sm font-medium text-gray-500 transition-all">
            <i class="fa-solid fa-arrow-up mr-2"></i>{{ 'form.income' | translate }}
          </button>
        </div>

        <!-- Amount -->
        <div>
          <label for="amount" class="block text-sm font-medium text-gray-700 mb-1">{{ 'form.amount' | translate }}</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span class="text-gray-500 sm:text-sm">$</span>
            </div>
            <input type="number" id="amount" formControlName="amount" step="0.01"
                   class="block w-full pl-7 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                   placeholder="0.00">
            <div class="absolute inset-y-0 right-0 flex items-center pr-2">
              <button type="button" (click)="showCalculator.set(!showCalculator())" 
                      class="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50">
                <i class="fa-solid fa-calculator"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Category -->
        <div>
          <label for="category" class="block text-sm font-medium text-gray-700 mb-1">{{ 'form.category' | translate }}</label>
          <select id="category" formControlName="category" 
                  class="block w-full py-3 px-4 border border-gray-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white transition-colors">
            @for (cat of categories(); track cat.id) {
              <option [value]="cat.id">{{ cat.name | translate }}</option>
            }
          </select>
        </div>

        <!-- Custom Category -->
        @if (form.get('category')?.value === 'other') {
          <div>
            <label for="customCategory" class="block text-sm font-medium text-gray-700 mb-1">{{ 'form.other_category' | translate }}</label>
            <input type="text" id="customCategory" formControlName="customCategory"
                   class="block w-full py-3 px-4 border border-gray-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                   placeholder="Enter category name">
          </div>
        }

        <!-- Date -->
        <div>
          <label for="date" class="block text-sm font-medium text-gray-700 mb-1">{{ 'form.date' | translate }}</label>
          <input type="datetime-local" id="date" formControlName="date"
                 class="block w-full py-3 px-4 border border-gray-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors">
        </div>

        <!-- Remark -->
        <div>
          <label for="remark" class="block text-sm font-medium text-gray-700 mb-1">{{ 'form.remark' | translate }}</label>
          <textarea id="remark" formControlName="remark" rows="2"
                    class="block w-full py-3 px-4 border border-gray-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                    placeholder="Optional details..."></textarea>
        </div>

        <!-- Submit -->
        <button type="submit" [disabled]="!form.valid"
                class="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
          <i class="fa-solid fa-check mr-2 mt-0.5"></i> {{ 'form.save' | translate }}
        </button>
      </form>

      <!-- Calculator Overlay -->
      @if (showCalculator()) {
        <div class="absolute top-0 left-0 right-0 z-10 shadow-2xl">
          <app-calculator (closeCalculator)="showCalculator.set(false)" (resultSelected)="onCalculatorResult($event)"></app-calculator>
        </div>
      }
    </div>
  `
})
export class TransactionFormComponent {
  private fb = inject(FormBuilder);
  private transactionService = inject(TransactionService);
  private ocrService = inject(OcrService);
  private translationService = inject(TranslationService);

  showCalculator = signal(false);
  isScanning = signal(false);

  categories = signal([
    { id: 'food', name: 'categories.food' },
    { id: 'transport', name: 'categories.transport' },
    { id: 'shopping', name: 'categories.shopping' },
    { id: 'bills', name: 'categories.bills' },
    { id: 'entertainment', name: 'categories.entertainment' },
    { id: 'salary', name: 'categories.salary' },
    { id: 'other', name: 'categories.other' }
  ]);

  form = this.fb.group({
    type: ['expense', Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    category: ['food', Validators.required],
    customCategory: [''],
    date: [this.formatDate(new Date()), Validators.required],
    remark: ['']
  });

  setType(type: 'income' | 'expense') {
    this.form.patchValue({ type });
    if (type === 'income') {
      this.form.patchValue({ category: 'salary' });
    } else {
      this.form.patchValue({ category: 'food' });
    }
  }

  onCalculatorResult(result: number) {
    this.form.patchValue({ amount: result });
    this.showCalculator.set(false);
  }

  onSubmit() {
    if (this.form.valid) {
      const val = this.form.value;
      const finalCategory = val.category === 'other' && val.customCategory 
        ? val.customCategory 
        : val.category;

      this.transactionService.addTransaction({
        type: val.type as 'income' | 'expense',
        amount: Number(val.amount),
        category: finalCategory as string,
        date: new Date(val.date as string).toISOString(),
        remark: val.remark || ''
      });

      // Reset form but keep type and date
      this.form.patchValue({
        amount: null,
        remark: '',
        customCategory: ''
      });
    }
  }

  private formatDate(date: Date): string {
    const d = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return d.toISOString().slice(0, 16);
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    
    const file = input.files[0];
    this.isScanning.set(true);
    
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const result = e.target?.result as string;
        const base64Data = result.split(',')[1];
        
        try {
          const ocrData = await this.ocrService.scanReceipt(base64Data, file.type);
          
          const patchData: Record<string, unknown> = {};
          if (ocrData.amount !== null) patchData['amount'] = ocrData.amount;
          if (ocrData.category !== null) {
            const validCategories = this.categories().map(c => c.id);
            if (validCategories.includes(ocrData.category)) {
              patchData['category'] = ocrData.category;
            } else {
              patchData['category'] = 'other';
              patchData['customCategory'] = ocrData.category;
            }
          }
          if (ocrData.date !== null) {
            try {
              const d = new Date(ocrData.date);
              if (!isNaN(d.getTime())) {
                patchData['date'] = this.formatDate(d);
              }
            } catch {
              // Ignore invalid dates
            }
          }
          if (ocrData.remark !== null) patchData['remark'] = ocrData.remark;
          
          this.form.patchValue(patchData);
        } catch (err) {
          console.error('OCR failed', err);
          alert(this.translationService.get('form.scan_error'));
        } finally {
          this.isScanning.set(false);
          input.value = '';
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      this.isScanning.set(false);
      input.value = '';
    }
  }
}
