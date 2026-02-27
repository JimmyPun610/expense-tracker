import { Component, output, signal } from '@angular/core';
import { TranslatePipe } from '../core/pipes/translate.pipe';

@Component({
  selector: 'app-calculator',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
        <h3 class="font-medium text-gray-700">{{ 'calculator.title' | translate }}</h3>
        <button (click)="closeCalculator.emit()" class="text-gray-400 hover:text-gray-600">
          <i class="fa-solid fa-times"></i>
        </button>
      </div>
      
      <div class="p-4">
        <div class="bg-gray-100 rounded-xl p-4 mb-4 text-right">
          <div class="text-sm text-gray-500 h-5 mb-1">{{ expression() }}</div>
          <div class="text-3xl font-semibold text-gray-800 overflow-hidden text-ellipsis">{{ display() }}</div>
        </div>
        
        <div class="grid grid-cols-4 gap-2">
          <button (click)="clear()" class="col-span-2 p-3 rounded-xl bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors">
            {{ 'calculator.clear' | translate }}
          </button>
          <button (click)="appendOperator('/')" class="p-3 rounded-xl bg-blue-50 text-blue-600 font-medium hover:bg-blue-100 transition-colors">
            <i class="fa-solid fa-divide"></i>
          </button>
          <button (click)="appendOperator('*')" class="p-3 rounded-xl bg-blue-50 text-blue-600 font-medium hover:bg-blue-100 transition-colors">
            <i class="fa-solid fa-xmark"></i>
          </button>
          
          <button (click)="appendNumber('7')" class="p-3 rounded-xl bg-gray-50 text-gray-800 font-medium hover:bg-gray-100 transition-colors">7</button>
          <button (click)="appendNumber('8')" class="p-3 rounded-xl bg-gray-50 text-gray-800 font-medium hover:bg-gray-100 transition-colors">8</button>
          <button (click)="appendNumber('9')" class="p-3 rounded-xl bg-gray-50 text-gray-800 font-medium hover:bg-gray-100 transition-colors">9</button>
          <button (click)="appendOperator('-')" class="p-3 rounded-xl bg-blue-50 text-blue-600 font-medium hover:bg-blue-100 transition-colors">
            <i class="fa-solid fa-minus"></i>
          </button>
          
          <button (click)="appendNumber('4')" class="p-3 rounded-xl bg-gray-50 text-gray-800 font-medium hover:bg-gray-100 transition-colors">4</button>
          <button (click)="appendNumber('5')" class="p-3 rounded-xl bg-gray-50 text-gray-800 font-medium hover:bg-gray-100 transition-colors">5</button>
          <button (click)="appendNumber('6')" class="p-3 rounded-xl bg-gray-50 text-gray-800 font-medium hover:bg-gray-100 transition-colors">6</button>
          <button (click)="appendOperator('+')" class="p-3 rounded-xl bg-blue-50 text-blue-600 font-medium hover:bg-blue-100 transition-colors">
            <i class="fa-solid fa-plus"></i>
          </button>
          
          <button (click)="appendNumber('1')" class="p-3 rounded-xl bg-gray-50 text-gray-800 font-medium hover:bg-gray-100 transition-colors">1</button>
          <button (click)="appendNumber('2')" class="p-3 rounded-xl bg-gray-50 text-gray-800 font-medium hover:bg-gray-100 transition-colors">2</button>
          <button (click)="appendNumber('3')" class="p-3 rounded-xl bg-gray-50 text-gray-800 font-medium hover:bg-gray-100 transition-colors">3</button>
          <button (click)="calculate()" class="row-span-2 p-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-sm">
            {{ 'calculator.equals' | translate }}
          </button>
          
          <button (click)="appendNumber('0')" class="col-span-2 p-3 rounded-xl bg-gray-50 text-gray-800 font-medium hover:bg-gray-100 transition-colors">0</button>
          <button (click)="appendNumber('.')" class="p-3 rounded-xl bg-gray-50 text-gray-800 font-medium hover:bg-gray-100 transition-colors">.</button>
        </div>
        
        <div class="mt-4">
          <button (click)="useResult()" class="w-full py-3 rounded-xl bg-green-50 text-green-700 font-medium hover:bg-green-100 transition-colors border border-green-200">
            Use Result
          </button>
        </div>
      </div>
    </div>
  `
})
export class CalculatorComponent {
  closeCalculator = output<void>();
  resultSelected = output<number>();
  
  display = signal('0');
  expression = signal('');
  
  private currentOperand = '';
  private previousOperand = '';
  private operation: string | null = null;
  private shouldResetDisplay = false;

  clear() {
    this.display.set('0');
    this.expression.set('');
    this.currentOperand = '';
    this.previousOperand = '';
    this.operation = null;
  }

  appendNumber(number: string) {
    if (this.shouldResetDisplay) {
      this.display.set('');
      this.shouldResetDisplay = false;
    }
    
    if (number === '.' && this.display().includes('.')) return;
    
    const current = this.display();
    this.display.set(current === '0' && number !== '.' ? number : current + number);
  }

  appendOperator(operator: string) {
    if (this.operation !== null && !this.shouldResetDisplay) {
      this.calculate();
    }
    
    this.previousOperand = this.display();
    this.operation = operator;
    this.expression.set(`${this.previousOperand} ${operator}`);
    this.shouldResetDisplay = true;
  }

  calculate() {
    if (this.operation === null || this.shouldResetDisplay) return;
    
    this.currentOperand = this.display();
    const prev = parseFloat(this.previousOperand);
    const current = parseFloat(this.currentOperand);
    
    if (isNaN(prev) || isNaN(current)) return;
    
    let result = 0;
    switch (this.operation) {
      case '+': result = prev + current; break;
      case '-': result = prev - current; break;
      case '*': result = prev * current; break;
      case '/': 
        if (current === 0) {
          this.display.set('Error');
          this.shouldResetDisplay = true;
          return;
        }
        result = prev / current; 
        break;
    }
    
    // Round to 4 decimal places to avoid floating point issues
    result = Math.round(result * 10000) / 10000;
    
    this.display.set(result.toString());
    this.expression.set(`${this.previousOperand} ${this.operation} ${this.currentOperand} =`);
    this.operation = null;
    this.shouldResetDisplay = true;
  }
  
  useResult() {
    const val = parseFloat(this.display());
    if (!isNaN(val)) {
      this.resultSelected.emit(val);
    }
  }
}
