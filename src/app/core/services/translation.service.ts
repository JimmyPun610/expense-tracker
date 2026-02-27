import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private currentLang = signal<string>('en');
  private translations = signal<Record<string, unknown>>({});

  constructor() {
    this.loadTranslations('en');
  }

  async loadTranslations(lang: string) {
    try {
      const response = await fetch(`/i18n/${lang}.json`);
      if (response.ok) {
        const data = await response.json();
        this.translations.set(data);
        this.currentLang.set(lang);
      }
    } catch (error) {
      console.error(`Failed to load translations for ${lang}`, error);
    }
  }

  get(key: string): string {
    const keys = key.split('.');
    let value: unknown = this.translations();
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return key;
      }
    }
    return typeof value === 'string' ? value : key;
  }

  setLanguage(lang: string) {
    this.loadTranslations(lang);
  }
  
  getCurrentLang() {
    return this.currentLang();
  }
}
