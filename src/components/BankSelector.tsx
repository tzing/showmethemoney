import { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import banksData from '../data/banks.json';
import './BankSelector.css';

interface Bank {
  no: string;
  name: string;
  "en-name"?: string;
  aliases?: string[];
}

interface BankSelectorProps {
  value?: string;
  onChange?: (code: string) => void;
  placeholder?: string;
  id?: string;
  name?: string;
  className?: string;
}

export default function BankSelector({ value, onChange, placeholder, id, name, className }: BankSelectorProps) {
  const { i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const getBankName = (bank: Bank) => {
    if (i18n.language.startsWith('en') && bank['en-name']) {
      return bank['en-name'];
    }
    return bank.name;
  };

  // Initialize from prop value if provided
  useEffect(() => {
    if (value) {
      const bank = banksData.find(b => b.no === value);
      if (bank) {
        setSelectedBank(bank);
        // Term will be updated by the selectedBank effect
      } else {
        // If value exists but not in list (custom?), just show value or keep empty?
        // Assuming value corresponds to a bank code.
        setSearchTerm(value);
      }
    }
  }, [value]);

  // Update search term when selected bank or language changes
  useEffect(() => {
    if (selectedBank) {
      setSearchTerm(`${selectedBank.no} ${getBankName(selectedBank)}`);
    }
  }, [selectedBank, i18n.language]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Reset search term to selected bank if valid, or leave as is if user typed something custom?
        // Better UX: if partial text that doesn't match, maybe clear or revert?
        // For now, let's leave it. But usually we want to revert to the selected value's display name.
        if (selectedBank) {
          setSearchTerm(`${selectedBank.no} ${getBankName(selectedBank)}`);
        } else {
          // If nothing selected and user typed text that isn't a selection, maybe clear it or treat as custom?
          // The prompt implies "Selection", so we should probably force selection or allow raw text?
          // Given "Ex: 822" was the old placeholder, maybe raw code is okay.
          // Let's keep the text as is if no bank selected, but it might be confusing.
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedBank]);

  const filteredBanks = useMemo<{ bank: Bank; altMatchText?: string }[]>(() => {
    if (!searchTerm) {
      return banksData.map(bank => ({ bank, altMatchText: undefined as string | undefined }));
    }

    // If the search term exactly matches the currently selected bank display, show all (or hidden?)
    // Usually if I click the input, I want to see options.
    // If I start typing, filter.
    // If searchTerm matches the format "(code) name", we might want to parse it or just search.

    const lowerTerm = searchTerm.toLowerCase();
    const filtered = banksData.reduce<{ bank: Bank; altMatchText?: string }[]>((acc, bank) => {
      const displayName = getBankName(bank);
      const displayMatches = displayName.toLowerCase().includes(lowerTerm);
      const nameMatches = bank.name.toLowerCase().includes(lowerTerm);
      const enMatches = bank['en-name'] ? bank['en-name'].toLowerCase().includes(lowerTerm) : false;
      const aliasMatch = bank.aliases?.find(alias => alias.toLowerCase().includes(lowerTerm));
      const codeMatches = bank.no.toLowerCase().includes(lowerTerm);

      if (!(displayMatches || nameMatches || enMatches || aliasMatch || codeMatches)) {
        return acc;
      }

      const altMatchText = !displayMatches
        ? aliasMatch || (enMatches ? bank['en-name'] : undefined) || (nameMatches ? bank.name : undefined)
        : undefined;

      acc.push({ bank, altMatchText });
      return acc;
    }, []);

    return filtered.sort((a, b) => a.bank.no.localeCompare(b.bank.no));
  }, [searchTerm, i18n.language]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
    setSelectedBank(null); // Clear selection when user types
    if (onChange) onChange(e.target.value); // Pass raw value while typing? Or only on select?
    // If we only pass on select, the parent won't know about partial inputs.
    // But this is a "Bank Code" input. The parent likely expects the code "822".
    // If user types "822", we should probably detect that.

    const exactMatch = banksData.find(b => b.no === e.target.value);
    if (exactMatch) {
      setSelectedBank(exactMatch);
      // Don't auto-complete text yet, let them finish typing or select.
    }
  };

  const handleSelectBank = (bank: Bank) => {
    setSelectedBank(bank);
    // SearchTerm update handled by effect
    setIsOpen(false);
    if (onChange) onChange(bank.no);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleClear = () => {
    setSearchTerm('');
    setSelectedBank(null);
    if (onChange) onChange('');
    // Keep dropdown open and focus input if needed
    // For better UX, focus back to input
    const inputEl = wrapperRef.current?.querySelector('input');
    if (inputEl) {
      inputEl.focus();
    }
  };

  // Helper to highlight matching text
  const HighlightMatch = ({ text, match }: { text: string, match: string }) => {
    if (!match) return <>{text}</>;

    const escapedMatch = match.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escapedMatch})`, 'gi'));

    return (
      <>
        {parts.map((part, i) => {
          // Check if this part matches the search term
          const isMatch = new RegExp(`^${escapedMatch}$`, 'i').test(part);
          return isMatch ? (
            <span key={i} className="match-highlight">{part}</span>
          ) : (
            part
          );
        })}
      </>
    );
  };

  return (
    <div className={`bank-selector ${className || ''}`} ref={wrapperRef}>
      {/* Hidden input to store the actual value (bank code only) for form submission */}
      <input
        type="hidden"
        name={name}
        value={selectedBank?.no || value || ''}
      />
      <div className="input-wrapper">
        {selectedBank && !isOpen ? (
          <div
            className="bank-input selected-view"
            onClick={() => {
              setIsOpen(true);
              // Keep the search term for editing if needed, or clear it?
              // If we click to edit, usually we want to see the text input.
              // Let's switch back to input mode on click.
            }}
          >
            <span className="bank-code">{selectedBank.no}</span>
            <span className="bank-name">{getBankName(selectedBank)}</span>
          </div>
        ) : (
          <input
            type="text"
            id={id}
            // name={name} - removed name from visible input so it doesn't submit the display text
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder={placeholder}
            autoComplete="off"
            className="bank-input"
          />
        )}
        {searchTerm && (
          <button
            type="button"
            className="clear-btn"
            onClick={handleClear}
            aria-label="Clear"
            tabIndex={-1}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>
      {isOpen && filteredBanks.length > 0 && (
        <ul className="bank-dropdown">
          {filteredBanks.map(({ bank, altMatchText }) => (
            <li
              key={bank.no}
              onClick={() => handleSelectBank(bank)}
              className={selectedBank?.no === bank.no ? 'selected' : ''}
            >
              <span className="bank-code">
                <HighlightMatch text={bank.no} match={searchTerm} />
              </span>
              <span className="bank-name">
                <HighlightMatch text={getBankName(bank)} match={searchTerm} />
                {altMatchText && (
                  <span className="alt-match">
                    {' '}<HighlightMatch text={altMatchText} match={searchTerm} />
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
