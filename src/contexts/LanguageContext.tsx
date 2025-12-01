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
    'chart.incomeDistribution': 'Income Distribution',
    'chart.expenseDistribution': 'Expense Distribution',
    
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
    
    // Day Details Dialog
    'dialog.income': 'Income',
    'dialog.expense': 'Expense',
    'dialog.profit': 'Profit',
    'dialog.amount': 'Amount',
    'dialog.category': 'Category',
    'dialog.addIncome': 'Add Income',
    'dialog.addExpense': 'Add Expense',
    'dialog.save': 'Save',
    'dialog.cancel': 'Cancel',
    'dialog.selectCategory': 'Select category',
    
    // Profile
    'profile': 'Profile',
    'email': 'Email',
    'username': 'Username',
    'enterUsername': 'Enter username',
    'save': 'Save',
    'cancel': 'Cancel',
    'edit': 'Edit',
    'profileUpdated': 'Profile updated successfully',
    'updateFailed': 'Failed to update profile',
    'usernameRequired': 'Username is required',
    
    // Category Management
    'category.edit': 'Edit',
    'category.manageIncome': 'Manage Income Categories',
    'category.manageExpense': 'Manage Expense Categories',
    'category.newPlaceholder': 'New category name',
    'category.noCategories': 'No categories yet. Add one above.',
    'dialog.close': 'Close',
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
    'chart.incomeDistribution': 'ការបែងចែកចំណូល',
    'chart.expenseDistribution': 'ការបែងចែកចំណាយ',
    
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
    
    // Day Details Dialog
    'dialog.income': 'ចំណូល',
    'dialog.expense': 'ចំណាយ',
    'dialog.profit': 'ប្រាក់ចំណេញ',
    'dialog.amount': 'ចំនួនទឹកប្រាក់',
    'dialog.category': 'ប្រភេទ',
    'dialog.addIncome': 'បន្ថែមចំណូល',
    'dialog.addExpense': 'បន្ថែមចំណាយ',
    'dialog.save': 'រក្សាទុក',
    'dialog.cancel': 'បោះបង់',
    'dialog.selectCategory': 'ជ្រើសរើសប្រភេទ',
    
    // Profile
    'profile': 'គណនី',
    'email': 'អ៊ីមែល',
    'username': 'ឈ្មោះអ្នកប្រើ',
    'enterUsername': 'បញ្ចូលឈ្មោះអ្នកប្រើ',
    'save': 'រក្សាទុក',
    'cancel': 'បោះបង់',
    'edit': 'កែសម្រួល',
    'profileUpdated': 'បានធ្វើបច្ចុប្បន្នភាពគណនីដោយជោគជ័យ',
    'updateFailed': 'បរាជ័យក្នុងការធ្វើបច្ចុប្បន្នភាពគណនី',
    'usernameRequired': 'ឈ្មោះអ្នកប្រើត្រូវការ',
    
    // Category Management
    'category.edit': 'កែសម្រួល',
    'category.manageIncome': 'គ្រប់គ្រងប្រភេទចំណូល',
    'category.manageExpense': 'គ្រប់គ្រងប្រភេទចំណាយ',
    'category.newPlaceholder': 'ឈ្មោះប្រភេទថ្មី',
    'category.noCategories': 'មិនទាន់មានប្រភេទទេ។ បន្ថែមនៅខាងលើ។',
    'dialog.close': 'បិទ',
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
