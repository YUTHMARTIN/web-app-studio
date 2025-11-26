import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { UploadIcon } from 'lucide-react';
import { parseCSV } from '@/utils/csvUtils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

interface CSVImportButtonProps {
  onImportComplete: () => void;
}

export function CSVImportButton({ onImportComplete }: CSVImportButtonProps) {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    // Determine transaction type from filename
    const fileName = file.name.toLowerCase();
    let transactionType: 'INCOME' | 'EXPENSE';
    
    if (fileName.includes('income')) {
      transactionType = 'INCOME';
    } else if (fileName.includes('expense')) {
      transactionType = 'EXPENSE';
    } else {
      toast.error('CSV filename must contain "income" or "expense"');
      return;
    }

    try {
      const text = await file.text();
      const parsedData = parseCSV(text);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to import transactions');
        return;
      }

      // Prepare transactions for insert
      const transactions = parsedData.map(row => ({
        user_id: user.id,
        date: row.date,
        type: transactionType,
        category: row.category,
        amount: row.amount,
        description: row.description || `${transactionType} on ${row.date}`,
      }));

      // Insert transactions
      const { error } = await supabase
        .from('transactions')
        .insert(transactions);

      if (error) {
        toast.error('Error importing CSV: ' + error.message);
      } else {
        toast.success(`Successfully imported ${transactions.length} ${transactionType.toLowerCase()} transactions!`);
        onImportComplete();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error parsing CSV file');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleCSVUpload}
        className="hidden"
        id="csv-upload"
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
      >
        <UploadIcon className="h-4 w-4 mr-2" />
        Import CSV
      </Button>
    </>
  );
}
