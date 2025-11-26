import { Transaction } from '@/types/finance';

export const exportIncomesToCSV = (transactions: Transaction[]) => {
  const incomes = transactions.filter(t => t.type === 'INCOME');
  
  if (incomes.length === 0) {
    throw new Error('No income transactions to export');
  }

  const headers = ['Date', 'Category', 'Amount', 'Description'];
  const csvRows = [
    headers.join(','),
    ...incomes.map(t => 
      [t.date, t.category, t.amount, `"${t.description || ''}"`].join(',')
    )
  ];

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `incomes_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportExpensesToCSV = (transactions: Transaction[]) => {
  const expenses = transactions.filter(t => t.type === 'EXPENSE');
  
  if (expenses.length === 0) {
    throw new Error('No expense transactions to export');
  }

  const headers = ['Date', 'Category', 'Amount', 'Description'];
  const csvRows = [
    headers.join(','),
    ...expenses.map(t => 
      [t.date, t.category, t.amount, `"${t.description || ''}"`].join(',')
    )
  ];

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `expenses_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const parseCSV = (csvText: string): Array<{date: string, category: string, amount: number, description: string}> => {
  const lines = csvText.split('\n').filter(line => line.trim());
  
  if (lines.length < 2) {
    throw new Error('CSV file is empty or invalid');
  }

  // Skip header row
  const dataLines = lines.slice(1);
  
  return dataLines.map((line, index) => {
    const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
    
    if (!values || values.length < 3) {
      throw new Error(`Invalid CSV format at line ${index + 2}`);
    }

    const [date, category, amountStr, description = ''] = values.map(v => 
      v.replace(/^"|"$/g, '').trim()
    );

    const amount = parseFloat(amountStr);
    
    if (isNaN(amount) || amount <= 0) {
      throw new Error(`Invalid amount at line ${index + 2}`);
    }

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error(`Invalid date format at line ${index + 2}. Expected YYYY-MM-DD`);
    }

    return { date, category, amount, description };
  });
};
