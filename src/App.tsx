import { useState, useEffect, useRef } from "react";

import wordsData from "./data/database_lemma.generated.json";

interface Word {
  id: string;
  root_ref: string | null;
  leaf_char: string;
  backlinks: string[];
}

const CharSequenceSearch = () => {
  const [query, setQuery] = useState("");
  const [sequences, setSequences] = useState<Word[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const prevQuery = usePrevious(query);

  useEffect(() => {
    const loadWords = () => {
      const wordsDataBase: Word[] = wordsData as Word[];
      setSequences(wordsDataBase);
      console.log(wordsDataBase.length + " words loaded");
    };
    loadWords();
  }, []); // Empty dependency array ensures this runs once on mount

  useEffect(() => {
    var word = sequences.find((w) => w.id === query);
    if (word) {
      var backlinks: string[] = word.backlinks;
      var expandedBacklinks = expandBacklinks(backlinks);
      setSuggestions(expandedBacklinks);
      setHighlightedIndex(0);
    } else {
      if (query.length > 0) {
        setQuery(prevQuery); // wrong words refused
      } else {
        // reset
        setSuggestions([]);
        setHighlightedIndex(-1);
      }
    }
  }, [query, sequences]);

  function expandBacklinks(backlinks: string[]): string[] {
    var expandedBacklinks: string[] = [];
    backlinks.forEach((b) => {
      var word: Word | undefined = sequences.find((w) => w.id === b);
      while (word != undefined && word.backlinks.length == 1) {
        word = sequences.find((w) => w.id === word.backlinks[0]);
      }
      if (!expandedBacklinks.includes(word.id)) {
        expandedBacklinks.push(word.id);
      }
    });
    return expandedBacklinks;
  }

  function usePrevious(value: string) {
    const ref = useRef("");
    useEffect(() => {
      ref.current = value;
    }, [value]);
    return ref.current;
  }

  function clamp(num: number, lower: number, upper: number) {
    return Math.min(Math.max(num, lower), upper);
  }

  function clampHighlightedIndex(value: number) {
    const max = suggestions.length - 1;
    const min = 0;
    if (value > max) {
      return min;
    } else if (value < min) {
      return max;
    }
    return value;
    //return clamp(value, 0, suggestions.length - 1);
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      setHighlightedIndex((prev) => clampHighlightedIndex(prev + 1));
    } else if (e.key === "ArrowUp") {
      setHighlightedIndex((prev) => clampHighlightedIndex(prev - 1));
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
        autoFocus
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
