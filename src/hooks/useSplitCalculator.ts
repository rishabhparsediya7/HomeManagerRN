import {useState, useCallback, useMemo} from 'react';

export type SplitMode = 'equal' | 'unequal' | 'percentage' | 'share';

export interface Participant {
  userId: string;
  name: string;
  profilePicture?: string | null;
}

export interface SplitResult {
  userId: string;
  name: string;
  amountOwed: number;
  percentage?: number;
  shares?: number;
}

interface UseSplitCalculatorProps {
  totalAmount: number;
  participants: Participant[];
}

export function useSplitCalculator({
  totalAmount,
  participants,
}: UseSplitCalculatorProps) {
  const [splitMode, setSplitMode] = useState<SplitMode>('equal');

  // Per-user custom amounts (for unequal mode)
  const [customAmounts, setCustomAmounts] = useState<Record<string, number>>(
    {},
  );

  // Per-user percentages (for percentage mode)
  const [percentages, setPercentages] = useState<Record<string, number>>({});

  // Per-user shares (for share mode)
  const [shares, setShares] = useState<Record<string, number>>({});

  /**
   * Calculate equal split
   */
  const equalSplit = useMemo((): SplitResult[] => {
    if (participants.length === 0 || totalAmount <= 0) return [];

    const perPerson = totalAmount / participants.length;
    const rounded = Math.floor(perPerson * 100) / 100;
    const remainder = totalAmount - rounded * participants.length;

    return participants.map((p, i) => ({
      userId: p.userId,
      name: p.name,
      amountOwed: i === 0 ? rounded + remainder : rounded,
    }));
  }, [participants, totalAmount]);

  /**
   * Calculate unequal split (custom amounts)
   */
  const unequalSplit = useMemo((): SplitResult[] => {
    return participants.map(p => ({
      userId: p.userId,
      name: p.name,
      amountOwed: customAmounts[p.userId] || 0,
    }));
  }, [participants, customAmounts]);

  /**
   * Calculate percentage-based split
   */
  const percentageSplit = useMemo((): SplitResult[] => {
    return participants.map(p => {
      const pct = percentages[p.userId] || 0;
      const amount = Math.round(totalAmount * (pct / 100) * 100) / 100;
      return {
        userId: p.userId,
        name: p.name,
        amountOwed: amount,
        percentage: pct,
      };
    });
  }, [participants, percentages, totalAmount]);

  /**
   * Calculate share-based split
   */
  const shareSplit = useMemo((): SplitResult[] => {
    const totalShares = Object.values(shares).reduce(
      (sum, s) => sum + (s || 0),
      0,
    );

    if (totalShares === 0) {
      return participants.map(p => ({
        userId: p.userId,
        name: p.name,
        amountOwed: 0,
        shares: shares[p.userId] || 0,
      }));
    }

    const perShare = totalAmount / totalShares;

    return participants.map(p => {
      const userShares = shares[p.userId] || 0;
      return {
        userId: p.userId,
        name: p.name,
        amountOwed: Math.round(perShare * userShares * 100) / 100,
        shares: userShares,
      };
    });
  }, [participants, shares, totalAmount]);

  /**
   * Get current split results based on active mode
   */
  const splitResults = useMemo((): SplitResult[] => {
    switch (splitMode) {
      case 'equal':
        return equalSplit;
      case 'unequal':
        return unequalSplit;
      case 'percentage':
        return percentageSplit;
      case 'share':
        return shareSplit;
      default:
        return equalSplit;
    }
  }, [splitMode, equalSplit, unequalSplit, percentageSplit, shareSplit]);

  /**
   * Validation: check if the split totals match the expense amount
   */
  const validation = useMemo(() => {
    const splitTotal = splitResults.reduce((sum, r) => sum + r.amountOwed, 0);
    const diff = Math.abs(totalAmount - splitTotal);
    const isValid = diff < 0.01 && totalAmount > 0 && participants.length > 0;

    let message = '';
    if (totalAmount <= 0) {
      message = 'Enter an amount';
    } else if (participants.length === 0) {
      message = 'Add at least one participant';
    } else if (splitMode === 'unequal' && diff >= 0.01) {
      message = `₹${diff.toFixed(2)} ${
        splitTotal < totalAmount ? 'remaining' : 'over'
      }`;
    } else if (splitMode === 'percentage') {
      const totalPct = Object.values(percentages).reduce(
        (sum, p) => sum + (p || 0),
        0,
      );
      if (Math.abs(totalPct - 100) >= 0.01) {
        message = `${totalPct.toFixed(1)}% of 100%`;
      }
    }

    return {isValid, message, splitTotal, diff};
  }, [splitResults, totalAmount, participants, splitMode, percentages]);

  // Setters
  const setCustomAmount = useCallback((userId: string, amount: number) => {
    setCustomAmounts(prev => ({...prev, [userId]: amount}));
  }, []);

  const setPercentage = useCallback((userId: string, pct: number) => {
    setPercentages(prev => ({...prev, [userId]: pct}));
  }, []);

  const setShare = useCallback((userId: string, shareCount: number) => {
    setShares(prev => ({...prev, [userId]: shareCount}));
  }, []);

  // Reset to defaults when changing mode
  const changeSplitMode = useCallback(
    (mode: SplitMode) => {
      setSplitMode(mode);
      if (mode === 'share') {
        // Default 1 share each
        const defaultShares: Record<string, number> = {};
        participants.forEach(p => {
          defaultShares[p.userId] = 1;
        });
        setShares(defaultShares);
      }
      if (mode === 'percentage' && participants.length > 0) {
        const defaultPct = Math.floor((100 / participants.length) * 100) / 100;
        const pcts: Record<string, number> = {};
        participants.forEach((p, i) => {
          pcts[p.userId] =
            i === 0
              ? defaultPct + (100 - defaultPct * participants.length)
              : defaultPct;
        });
        setPercentages(pcts);
      }
    },
    [participants],
  );

  return {
    splitMode,
    setSplitMode: changeSplitMode,
    splitResults,
    validation,
    // Unequal mode
    customAmounts,
    setCustomAmount,
    // Percentage mode
    percentages,
    setPercentage,
    // Share mode
    shares,
    setShare,
  };
}
