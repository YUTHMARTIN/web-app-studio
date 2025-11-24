import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'km';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Header
    'header.title': 'Finance Dashboard',
    'header.subtitle': 'Track your income and expenses',
    
    // Summary Cards
    'summary.totalIncome': 'Total Income',
    'summary.totalExpense': 'Total Expense',
    'summary.netProfit': 'Net Profit',
    
    // Charts
    'chart.expenseDistribution': 'Expense Distribution',
    'chart.expensesByCategory': 'Expenses by Category',
    
    // Monthly Input
    'monthly.title': 'Monthly Input',
    'monthly.day': 'Day',
    'monthly.income': 'Income ($)',
    'monthly.incomeCategory': 'Income Category',
    'monthly.expense': 'Expense ($)',
    'monthly.expenseCategory': 'Expense Category',
    'monthly.saveAll': 'Save All Entries',
    'monthly.placeholder.amount': '0.00',
    'monthly.placeholder.incomeCategory': 'e.g., Salary',
    'monthly.placeholder.expenseCategory': 'e.g., Groceries',
    
    // Transactions
    'transactions.title': 'Recent Transactions',
    'transactions.subtitle': 'View and manage your transaction history',
    'transactions.count': 'transaction',
    'transactions.counts': 'transactions',
    'transactions.date': 'Date',
    'transactions.type': 'Type',
    'transactions.category': 'Category',
    'transactions.description': 'Description',
    'transactions.amount': 'Amount',
    'transactions.income': 'INCOME',
    'transactions.expense': 'EXPENSE',
    
    // Toast messages
    'toast.error.emptyEntries': 'Please add at least one income or expense entry',
    'toast.success.added': 'Added',
    'toast.success.transactions': 'transactions',
    
    // Months
    'month.january': 'January',
    'month.february': 'February',
    'month.march': 'March',
    'month.april': 'April',
    'month.may': 'May',
    'month.june': 'June',
    'month.july': 'July',
    'month.august': 'August',
    'month.september': 'September',
    'month.october': 'October',
    'month.november': 'November',
    'month.december': 'December',
  },
  km: {
    // Header
    'header.title': 'ផ្ទាំងគ្រប់គ្រងហិរញ្ញវត្ថុ',
    'header.subtitle': 'តាមដានចំណូល និងចំណាយរបស់អ្នក',
    
    // Summary Cards
    'summary.totalIncome': 'ចំណូលសរុប',
    'summary.totalExpense': 'ចំណាយសរុប',
    'summary.netProfit': 'ប្រាក់ចំណេញសុទ្ធ',
    
    // Charts
    'chart.expenseDistribution': 'ការបែងចែកចំណាយ',
    'chart.expensesByCategory': 'ចំណាយតាមប្រភេទ',
    
    // Monthly Input
    'monthly.title': 'បញ្ចូលប្រចាំខែ',
    'monthly.day': 'ថ្ងៃ',
    'monthly.income': 'ចំណូល ($)',
    'monthly.incomeCategory': 'ប្រភេទចំណូល',
    'monthly.expense': 'ចំណាយ ($)',
    'monthly.expenseCategory': 'ប្រភេទចំណាយ',
    'monthly.saveAll': 'រក្សាទុកទាំងអស់',
    'monthly.placeholder.amount': '0.00',
    'monthly.placeholder.incomeCategory': 'ឧ. ប្រាក់ខែ',
    'monthly.placeholder.expenseCategory': 'ឧ. ទិញផ្សារ',
    
    // Transactions
    'transactions.title': 'ប្រតិបត្តិការថ្មីៗ',
    'transactions.subtitle': 'មើល និងគ្រប់គ្រងប្រវត្តិប្រតិបត្តិការរបស់អ្នក',
    'transactions.count': 'ប្រតិបត្តិការ',
    'transactions.counts': 'ប្រតិបត្តិការ',
    'transactions.date': 'កាលបរិច្ឆេទ',
    'transactions.type': 'ប្រភេទ',
    'transactions.category': 'ប្រភេទ',
    'transactions.description': 'ពិពណ៌នា',
    'transactions.amount': 'ចំនួនទឹកប្រាក់',
    'transactions.income': 'ចំណូល',
    'transactions.expense': 'ចំណាយ',
    
    // Toast messages
    'toast.error.emptyEntries': 'សូមបញ្ចូលចំណូល ឬចំណាយយ៉ាងហោចណាស់មួយ',
    'toast.success.added': 'បានបន្ថែម',
    'toast.success.transactions': 'ប្រតិបត្តិការ',
    
    // Months
    'month.january': 'មករា',
    'month.february': 'កុម្ភៈ',
    'month.march': 'មីនា',
    'month.april': 'មេសា',
    'month.may': 'ឧសភា',
    'month.june': 'មិថុនា',
    'month.july': 'កក្កដា',
    'month.august': 'សីហា',
    'month.september': 'កញ្ញា',
    'month.october': 'តុលា',
    'month.november': 'វិច្ឆិកា',
    'month.december': 'ធ្នូ',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
