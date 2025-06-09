import React, { useState } from 'react';

export const QnAPage = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [documentExcerpts, setDocumentExcerpts] = useState<string[]>([]);

  const handleQuestionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuestion(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the question to your backend API
    // and receive the answer and relevant document excerpts.
    // For now, let's simulate a response.
    setAnswer('This is a simulated answer to your question.');
    setDocumentExcerpts([
      'Excerpt from Document 1: Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      'Excerpt from Document 2: Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    ]);
  };

  return (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Q&A Interface</h2>

          <form onSubmit={handleSubmit} className="space-y-4 mb-8">
            <div>
              <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
                Ask a Question
              </label>
              <textarea
                id="question"
                rows={4}
                className="w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Type your question here..."
                value={question}
                onChange={handleQuestionChange}
                required
              ></textarea>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Get Answer
              </button>
            </div>
          </form>

          {answer && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Answer:</h3>
              <p className="text-gray-800 mb-4">{answer}</p>

              {documentExcerpts.length > 0 && (
                <div>
                  <h4 className="text-md font-semibold text-gray-700 mb-2">Relevant Document Excerpts:</h4>
                  <ul className="list-disc list-inside text-gray-600">
                    {documentExcerpts.map((excerpt, index) => (
                      <li key={index}>{excerpt}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
  );
};