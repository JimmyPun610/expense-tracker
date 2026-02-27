import { Component, ElementRef, ViewChild, effect, inject, signal } from '@angular/core';
import { TransactionService, Transaction } from '../core/services/transaction.service';
import { TranslatePipe } from '../core/pipes/translate.pipe';
import { CurrencyPipe, PercentPipe } from '@angular/common';
import * as d3 from 'd3';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [TranslatePipe, CurrencyPipe, PercentPipe],
  template: `
    <div class="space-y-6">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-medium text-gray-500">{{ 'report.total_expense' | translate }}</h3>
            <div class="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
              <i class="fa-solid fa-arrow-trend-down"></i>
            </div>
          </div>
          <div>
            <p class="text-3xl font-bold text-gray-900">{{ currentMonthExpense() | currency }}</p>
            <div class="mt-2 flex items-center text-sm">
              @if (expenseChange() > 0) {
                <span class="text-red-500 font-medium flex items-center bg-red-50 px-2 py-0.5 rounded-full">
                  <i class="fa-solid fa-arrow-up mr-1 text-xs"></i>
                  {{ expenseChange() | percent:'1.1-1' }}
                </span>
                <span class="text-gray-500 ml-2">{{ 'report.increase' | translate }} {{ 'report.vs_last_month' | translate }}</span>
              } @else if (expenseChange() < 0) {
                <span class="text-green-500 font-medium flex items-center bg-green-50 px-2 py-0.5 rounded-full">
                  <i class="fa-solid fa-arrow-down mr-1 text-xs"></i>
                  {{ -expenseChange() | percent:'1.1-1' }}
                </span>
                <span class="text-gray-500 ml-2">{{ 'report.decrease' | translate }} {{ 'report.vs_last_month' | translate }}</span>
              } @else {
                <span class="text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">No change</span>
              }
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-medium text-gray-500">{{ 'report.total_income' | translate }}</h3>
            <div class="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-500">
              <i class="fa-solid fa-arrow-trend-up"></i>
            </div>
          </div>
          <div>
            <p class="text-3xl font-bold text-gray-900">{{ currentMonthIncome() | currency }}</p>
            <div class="mt-2 flex items-center text-sm">
              @if (incomeChange() > 0) {
                <span class="text-green-500 font-medium flex items-center bg-green-50 px-2 py-0.5 rounded-full">
                  <i class="fa-solid fa-arrow-up mr-1 text-xs"></i>
                  {{ incomeChange() | percent:'1.1-1' }}
                </span>
                <span class="text-gray-500 ml-2">{{ 'report.increase' | translate }} {{ 'report.vs_last_month' | translate }}</span>
              } @else if (incomeChange() < 0) {
                <span class="text-red-500 font-medium flex items-center bg-red-50 px-2 py-0.5 rounded-full">
                  <i class="fa-solid fa-arrow-down mr-1 text-xs"></i>
                  {{ -incomeChange() | percent:'1.1-1' }}
                </span>
                <span class="text-gray-500 ml-2">{{ 'report.decrease' | translate }} {{ 'report.vs_last_month' | translate }}</span>
              } @else {
                <span class="text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">No change</span>
              }
            </div>
          </div>
        </div>
        
        <div class="bg-blue-600 rounded-2xl p-6 shadow-md text-white flex flex-col justify-between relative overflow-hidden">
          <div class="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
          <div class="flex items-center justify-between mb-4 relative z-10">
            <h3 class="text-sm font-medium text-blue-100">{{ 'report.balance' | translate }}</h3>
            <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white backdrop-blur-sm">
              <i class="fa-solid fa-wallet"></i>
            </div>
          </div>
          <div class="relative z-10">
            <p class="text-4xl font-bold">{{ currentMonthIncome() - currentMonthExpense() | currency }}</p>
            <p class="text-blue-100 text-sm mt-2">{{ 'report.current_month' | translate }}</p>
          </div>
        </div>
      </div>

      <!-- Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 class="text-lg font-semibold text-gray-800 mb-6 flex items-center">
            <i class="fa-solid fa-chart-pie text-blue-500 mr-2"></i>
            {{ 'report.category_breakdown' | translate }}
          </h3>
          <div class="flex justify-center items-center min-h-[300px]" #pieChartContainer></div>
        </div>
        
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 class="text-lg font-semibold text-gray-800 mb-6 flex items-center">
            <i class="fa-solid fa-chart-column text-blue-500 mr-2"></i>
            {{ 'report.daily_trend' | translate }}
          </h3>
          <div class="flex justify-center items-center min-h-[300px]" #barChartContainer></div>
        </div>
      </div>
    </div>
  `
})
export class ReportComponent {
  transactionService = inject(TransactionService);
  
  @ViewChild('pieChartContainer', { static: false }) pieChartContainer!: ElementRef;
  @ViewChild('barChartContainer', { static: false }) barChartContainer!: ElementRef;

  currentMonthExpense = signal(0);
  currentMonthIncome = signal(0);
  expenseChange = signal(0);
  incomeChange = signal(0);

  constructor() {
    effect(() => {
      const current = this.transactionService.currentMonthTransactions();
      const last = this.transactionService.lastMonthTransactions();
      
      const currExp = current.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      const currInc = current.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      
      const lastExp = last.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      const lastInc = last.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      
      this.currentMonthExpense.set(currExp);
      this.currentMonthIncome.set(currInc);
      
      this.expenseChange.set(lastExp === 0 ? (currExp > 0 ? 1 : 0) : (currExp - lastExp) / lastExp);
      this.incomeChange.set(lastInc === 0 ? (currInc > 0 ? 1 : 0) : (currInc - lastInc) / lastInc);

      // Give Angular time to render the containers before drawing charts
      setTimeout(() => {
        this.drawPieChart(current.filter(t => t.type === 'expense'));
        this.drawBarChart(current.filter(t => t.type === 'expense'));
      }, 0);
    });
  }

  private drawPieChart(transactions: Transaction[]) {
    if (!this.pieChartContainer) return;
    
    const element = this.pieChartContainer.nativeElement;
    d3.select(element).selectAll('*').remove();

    if (transactions.length === 0) {
      d3.select(element).append('p').attr('class', 'text-gray-400 italic').text('No data available');
      return;
    }

    const data = d3.rollup(transactions, v => d3.sum(v, d => d.amount), d => d.category);
    const chartData = Array.from(data, ([name, value]) => ({ name, value }));

    const width = 300;
    const height = 300;
    const margin = 20;
    const radius = Math.min(width, height) / 2 - margin;

    const svg = d3.select(element)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const color = d3.scaleOrdinal()
      .domain(chartData.map(d => d.name))
      .range(['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1']);

    const pie = d3.pie<unknown, {name: string, value: number}>()
      .value(d => d.value)
      .sort(null);

    const arc = d3.arc<d3.PieArcDatum<{name: string, value: number}>>()
      .innerRadius(radius * 0.5) // Donut chart
      .outerRadius(radius);

    const arcs = svg.selectAll('arc')
      .data(pie(chartData))
      .enter()
      .append('g')
      .attr('class', 'arc');

    arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => color(d.data.name) as string)
      .attr('stroke', 'white')
      .style('stroke-width', '2px')
      .style('opacity', 0.8)
      .on('mouseover', function() {
        d3.select(this).style('opacity', 1).style('cursor', 'pointer');
      })
      .on('mouseout', function() {
        d3.select(this).style('opacity', 0.8);
      });

    // Add labels
    const outerArc = d3.arc<d3.PieArcDatum<{name: string, value: number}>>()
      .innerRadius(radius * 0.9)
      .outerRadius(radius * 0.9);

    arcs.append('text')
      .attr('transform', d => `translate(${outerArc.centroid(d)})`)
      .attr('dy', '.35em')
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#4b5563')
      .style('font-weight', '500')
      .text(d => d.data.name.substring(0, 10));
  }

  private drawBarChart(transactions: Transaction[]) {
    if (!this.barChartContainer) return;
    
    const element = this.barChartContainer.nativeElement;
    d3.select(element).selectAll('*').remove();

    if (transactions.length === 0) {
      d3.select(element).append('p').attr('class', 'text-gray-400 italic').text('No data available');
      return;
    }

    // Group by day of month
    const dataByDay = d3.rollup(
      transactions,
      v => d3.sum(v, d => d.amount),
      d => new Date(d.date).getDate()
    );

    // Create array for all days in current month up to today
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    
    const chartData = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      return {
        day: day.toString(),
        value: dataByDay.get(day) || 0
      };
    });

    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = element.clientWidth || 400;
    const height = 300;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(element)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .domain(chartData.map(d => d.day))
      .range([0, innerWidth])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(chartData, d => d.value) || 100])
      .nice()
      .range([innerHeight, 0]);

    // Add X axis
    svg.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).tickValues(x.domain().filter((_, i) => i % 5 === 0 || i === daysInMonth - 1)))
      .attr('color', '#9ca3af')
      .selectAll('text')
      .style('font-family', 'Inter, sans-serif');

    // Add Y axis
    svg.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => `$${d}`))
      .attr('color', '#9ca3af')
      .selectAll('text')
      .style('font-family', 'Inter, sans-serif');

    // Add bars
    svg.selectAll('rect')
      .data(chartData)
      .enter()
      .append('rect')
      .attr('x', d => x(d.day) as number)
      .attr('y', d => y(d.value))
      .attr('width', x.bandwidth())
      .attr('height', d => innerHeight - y(d.value))
      .attr('fill', '#3b82f6')
      .attr('rx', 4)
      .style('opacity', 0.8)
      .on('mouseover', function() {
        d3.select(this).style('opacity', 1).attr('fill', '#2563eb');
      })
      .on('mouseout', function() {
        d3.select(this).style('opacity', 0.8).attr('fill', '#3b82f6');
      });
  }
}
