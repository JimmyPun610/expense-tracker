import { Injectable, signal, computed } from '@angular/core';

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  remark: string;
  date: string;
  type: 'income' | 'expense';
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private readonly STORAGE_KEY = 'expense_tracker_transactions';
  
  private transactionsSignal = signal<Transaction[]>(this.loadFromStorage());
  
  public transactions = this.transactionsSignal.asReadonly();
  
  public currentMonthTransactions = computed(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return this.transactionsSignal().filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
  });

  public lastMonthTransactions = computed(() => {
    const now = new Date();
    let lastMonth = now.getMonth() - 1;
    let year = now.getFullYear();
    if (lastMonth < 0) {
      lastMonth = 11;
      year--;
    }
    
    return this.transactionsSignal().filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === lastMonth && d.getFullYear() === year;
    });
  });

  addTransaction(transaction: Omit<Transaction, 'id'>) {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID()
    };
    
    this.transactionsSignal.update(transactions => {
      const updated = [newTransaction, ...transactions].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      this.saveToStorage(updated);
      return updated;
    });
  }

  deleteTransaction(id: string) {
    this.transactionsSignal.update(transactions => {
      const updated = transactions.filter(t => t.id !== id);
      this.saveToStorage(updated);
      return updated;
    });
  }

  private loadFromStorage(): Transaction[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load transactions from local storage', e);
      return [];
    }
  }

  private saveToStorage(transactions: Transaction[]) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to save transactions to local storage', e);
    }
  }
}
