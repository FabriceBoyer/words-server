import bz2
import gzip
import json
import os

# data comes from :
# https://raw.githubusercontent.com/michmech/lemmatization-lists/refs/heads/master/lemmatization-en.txt
# https://github.com/dwyl/english-words/blob/master/words.txt

# TODO mark words from char seq to identify them


def get_words_from_file(file_path: str, words: set[str]):
    """Read words from a file, using space and newline as separators, and remove duplicates."""
    with open(file_path, "r", encoding="utf-8") as file:
        text: str = file.read()
    # Splitting by whitespace (space, newline, tab, etc.)
    words.update(set(text.split()))
    return sorted(words)  # Sort for consistency


def build_sequences(words):  # -> dict:
    """Build intermediary character sequences for words, adding unique backlink references."""
    sequences = {}

    for word in words:
        previous: str = ""
        for i in range(len(word)):
            current = word[: i + 1]
            if current not in sequences:
                sequences[current] = {
                    "id": current,
                    "root_ref": previous if previous in sequences else None,
                    "leaf_char": word[i],
                    "is_word": current == word,
                    "backlinks": set(),
                }
            if previous in sequences:
                # Add backlink to previous sequence ensuring uniqueness
                sequences[previous]["backlinks"].add(current)
            previous = current

    # Convert sets to lists for JSON serialization
    for key in sequences:
        sequences[key]["backlinks"] = list(sequences[key]["backlinks"])

    return sequences


def save_to_json(data, output_file):
    """Save the data to a JSON file."""
    with open(output_file, "w", encoding="utf-8") as file:
        json.dump(data, file, ensure_ascii=False, indent=4)


def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_file = os.path.join(script_dir, "../src/data/database_lemma.generated.json")

    words: set[str] = set()
    for file in ["words.txt", "lemmatization-en.txt", "lemmatization-fr.txt"]:
        file_path: str = os.path.join(script_dir, f"../data/{file}")
        get_words_from_file(file_path, words)
    print(f"Found {len(words)} words")

    sequences = build_sequences(words)
    print(f"Found {len(sequences)} sequences")

    save_to_json(list(sequences.values()), output_file)

    # write humanized output file size
    print(f"Output written to {output_file}")
    print(f"Output file size: {os.path.getsize(output_file) / 1024 / 1024:.2f} MB")

    compressed_output_file = output_file + ".gz"
    with gzip.GzipFile(compressed_output_file, "w") as f:
        f.write(open(output_file, "rb").read())
    print(f"Compressed output written to {compressed_output_file}")
    print(
        f"Compressed output file size: {os.path.getsize(compressed_output_file) / 1024 / 1024:.2f} MB"
    )


if __name__ == "__main__":
    main()
