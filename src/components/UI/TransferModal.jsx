import { useState, useEffect } from 'react';
import Modal from './Modal';
import InputField from './InputField';
import AnimatedButton from './AnimatedButton';
import { useFinance } from '../../context/FinanceContext';
import { useNotification } from '../../context/NotificationContext';
import { ArrowRightLeft, DollarSign, FileText } from 'lucide-react';

const TransferModal = ({ isOpen, onClose }) => {
  const { accounts, transferFunds, currencySymbol, formatCurrency } = useFinance();
  const { addNotification } = useNotification();
  
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && accounts.length >= 2) {
      setFromAccount(accounts[0].id);
      setToAccount(accounts[1].id);
      setAmount('');
      setMemo('');
    }
  }, [isOpen, accounts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fromAccount || !toAccount) {
      return addNotification("Error", "Please select both source and destination accounts.", "danger");
    }
    if (fromAccount === toAccount) {
      return addNotification("Error", "Cannot transfer to the same account.", "danger");
    }
    
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return addNotification("Invalid Amount", "Please enter a valid transfer amount.", "danger");
    }

    setIsLoading(true);
    try {
      await transferFunds(fromAccount, toAccount, parsedAmount, memo || 'Transfer');
      addNotification("Transfer Successful", `${formatCurrency(parsedAmount)} moved successfully.`, "success");
      onClose();
    } catch (err) {
      addNotification("Transfer Failed", err.message, "danger");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Transfer Funds">
      <form onSubmit={handleSubmit} className="space-y-4">
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 space-y-1">
            <label className="text-sm font-medium text-textMain ml-1">From</label>
            <div className="relative">
              <select 
                value={fromAccount} 
                onChange={(e) => setFromAccount(e.target.value)}
                className="w-full bg-surface border border-borderLight rounded-xl px-4 py-2.5 text-textMain focus:ring-2 focus:ring-primary/50 outline-none appearance-none"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({formatCurrency(acc.balance)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-end justify-center pb-2 hidden md:flex">
            <ArrowRightLeft className="text-textMuted" size={20} />
          </div>

          <div className="flex-1 space-y-1">
            <label className="text-sm font-medium text-textMain ml-1">To</label>
            <div className="relative">
              <select 
                value={toAccount} 
                onChange={(e) => setToAccount(e.target.value)}
                className="w-full bg-surface border border-borderLight rounded-xl px-4 py-2.5 text-textMain focus:ring-2 focus:ring-primary/50 outline-none appearance-none"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({formatCurrency(acc.balance)})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <InputField
          id="transfer-amount"
          label={`Amount (${currencySymbol})`}
          type="number"
          icon={DollarSign}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          min="0.01"
          step="0.01"
          required
        />

        <InputField
          id="transfer-memo"
          label="Memo (Optional)"
          type="text"
          icon={FileText}
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="e.g. Rent share"
        />

        <div className="pt-2 flex gap-3">
          <AnimatedButton 
            type="button" 
            variant="soft" 
            className="flex-1" 
            onClick={onClose}
            disabled={isLoading}
          >
             Cancel
          </AnimatedButton>
          <AnimatedButton 
            type="submit" 
            className="flex-1" 
            icon={ArrowRightLeft}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Transfer"}
          </AnimatedButton>
        </div>

      </form>
    </Modal>
  );
};

export default TransferModal;
