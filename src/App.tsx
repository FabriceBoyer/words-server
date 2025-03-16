import { useState, useEffect } from "react";

import wordsData from "./data/database_lemma.generated.json";

interface Record {
  [name: string]: Word;
}
interface Word {
  ref: string;
  char: string;
  backlinks: string[];
}
const CharSequenceSearch = () => {
  const [query, setQuery] = useState("");
  const [sequences, setSequences] = useState<Record>({});
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  useEffect(() => {
    const loadWords = () => {
      const wordsDatabase = JSON.parse(JSON.stringify(wordsData));
      setSequences(wordsDatabase);
      console.log(Object.keys(wordsDatabase).length + " words loaded");
    };

    loadWords();
  }, []); // Empty dependency array ensures this runs once on mount

  useEffect(() => {
    setHighlightedIndex(-1);
    if (query in sequences) {
      var backlinks = sequences[query].backlinks;
      if (backlinks.length == 1) {
        setQuery(backlinks[0]);
        return;
      }
      setSuggestions(backlinks);
    } else {
      setQuery(query.substring(0, query.length - 1)); // wrong words refused
      setSuggestions([]);
    }
  }, [query, sequences]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      setHighlightedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      setQuery(suggestions[highlightedIndex]);
      setSuggestions([]);
    }
  };

  return (
    <div className="container">
      <h1>Words Search</h1>
      <input
        type="text"
        className="search-bar"
        placeholder="Search character sequence..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <div className="word-list">
        {suggestions.length === 0 ? (
          <div style={{ textAlign: "center" }}>
            <p>No suggestion found</p>
          </div>
        ) : (
          suggestions.map((item, index) => (
            <div
              key={item}
              className={`word-item ${
                highlightedIndex === index ? "highlight" : ""
              }`}
              onClick={() => setQuery(item)}
            >
              {item}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CharSequenceSearch;
