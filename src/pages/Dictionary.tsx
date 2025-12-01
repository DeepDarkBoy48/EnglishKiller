import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { DictionaryPage as DictionaryComponent } from '../components/DictionaryPage';
import { DictionaryResult } from '../types';
import { AssistantContextType } from '../components/Layout';

export const Dictionary: React.FC = () => {
  const [dictionaryResult, setDictionaryResult] = useState<DictionaryResult | null>(null);
  const { setAssistantContext } = useOutletContext<AssistantContextType>();

  useEffect(() => {
    if (dictionaryResult) {
      setAssistantContext(dictionaryResult.word, 'word');
    }
  }, [dictionaryResult, setAssistantContext]);

  return (
    <DictionaryComponent
      initialResult={dictionaryResult}
      onResultChange={setDictionaryResult}
    />
  );
};
