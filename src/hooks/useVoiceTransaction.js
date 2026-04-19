import { useState, useCallback } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useNotification } from '../context/NotificationContext';

export const useVoiceTransaction = () => {
  const [isListening, setIsListening] = useState(false);
  const { addTransaction, accounts, currencySymbol } = useFinance();
  const { addNotification } = useNotification();

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addNotification("Error", "Your browser does not support voice input.", "danger");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      addNotification("Voice Active", "Listening... say 'Spent 20 on coffee'.", "info");
    };
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      
      let type = 'expense'; 
      let amount = 0;
      let name = 'Voice Entry';
      // Default to the first account available
      let accountId = accounts && accounts.length > 0 ? accounts[0].id : null; 

      if (!accountId) {
          addNotification("Error", "No accounts available to transact from.", "danger");
          return;
      }

      // Extract amount
      const amountMatch = transcript.match(/\d+(\.\d{1,2})?/);
      if (amountMatch) {
         amount = parseFloat(amountMatch[0]);
      } else {
         addNotification("Voice Failed", "Could not detect a monetary amount in your phrase.", "danger");
         return;
      }

      // Extract transaction type
      if (transcript.includes("earned") || transcript.includes("received") || transcript.includes("deposit") || transcript.includes("got")) {
         type = 'income';
      }

      // Extract description
      const stopWords = ['spent', 'paid', 'dollars', 'bucks', 'rupees', 'euros', 'on', 'for', 'about'];
      let words = transcript.split(' ');
      
      // Attempt to find 'on' or 'for' to get context
      let contextIdx = words.indexOf('on');
      if (contextIdx === -1) contextIdx = words.indexOf('for');
      
      if (contextIdx !== -1 && contextIdx < words.length - 1) {
          name = words.slice(contextIdx + 1).join(' ');
      } else {
          // Fallback: remove stop words and numbers to find the core subject
          name = words.filter(w => !stopWords.includes(w) && isNaN(parseFloat(w))).join(' ');
          if (!name) name = "Miscellaneous";
      }

      // Capitalize
      name = name.charAt(0).toUpperCase() + name.slice(1);

      addTransaction(accountId, name, amount, type);
      addNotification("Voice Success", `Added ${type}: ${currencySymbol}${amount} for ${name}`, "success");
    };

    recognition.onerror = (event) => {
      if (event.error !== 'no-speech') {
        addNotification("Microphone Error", event.error, "danger");
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, [addTransaction, accounts, addNotification, currencySymbol]);

  return { isListening, startListening };
};
