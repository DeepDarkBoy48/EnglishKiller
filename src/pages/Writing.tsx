import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { WritingPage as WritingComponent } from '../components/WritingPage';
import { WritingResult } from '../types';
import { AssistantContextType } from '../components/Layout';

export const Writing: React.FC = () => {
  const [writingResult, setWritingResult] = useState<WritingResult | null>(null);
  const { setAssistantContext } = useOutletContext<AssistantContextType>();

  useEffect(() => {
    if (writingResult) {
      const context = writingResult.segments.map(s => s.text).join('');
      setAssistantContext(context, 'writing');
    }
  }, [writingResult, setAssistantContext]);

  return (
    <WritingComponent
      initialResult={writingResult}
      onResultChange={setWritingResult}
    />
  );
};
