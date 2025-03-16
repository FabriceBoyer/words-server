import { useState, useEffect } from "react";

import wordsData from "./data/database_lemma.generated.json";

const CharSequenceSearch = () => {
  const [query, setQuery] = useState("");
  const [sequences, setSequences] = useState<
    Record<string, { backlinks: string[] }>
  >({});
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // useEffect(() => {
  //   fetch("./data/database_lemma.generated.json")
  //     .then((res) => res.json())
  //     .then((data) => setSequences(data))
  //     .catch((err) => console.error("Failed to load data", err));
  // }, []);

  useEffect(() => {
    const loadAcronyms = () => {
      const wordsDatabase = JSON.parse(JSON.stringify(wordsData));

      setSequences(wordsDatabase);
      console.log(wordsDatabase.length + " words loaded");
    };

    loadAcronyms();
  }, []); // Empty dependency array ensures this runs once on mount

  useEffect(() => {
    if (query in sequences) {
      setSuggestions(sequences[query].backlinks || []);
    } else {
      setSuggestions([]);
    }
  }, [query, sequences]);

  return (
    <div className="container">
      <h1>Words Search</h1>
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <input
          type="text"
          className="border border-gray-300 rounded-lg p-2 w-80 text-lg"
          placeholder="Search character sequence..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {suggestions.length > 0 && (
          <ul className="mt-2 bg-white border border-gray-300 rounded-lg shadow-lg w-80">
            {suggestions.map((item) => (
              <li
                key={item}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => setQuery(item)}
              >
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CharSequenceSearch;
