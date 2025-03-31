import json
import os

# data comes from :
# https://raw.githubusercontent.com/michmech/lemmatization-lists/refs/heads/master/lemmatization-en.txt
# https://github.com/dwyl/english-words/blob/master/words.txt


def get_words_from_file(file_path):
    """Read words from a file, using space and newline as separators, and remove duplicates."""
    with open(file_path, "r", encoding="utf-8") as file:
        text = file.read()
    words = set(text.split())  # Splitting by whitespace (space, newline, tab, etc.)
    return sorted(words)  # Sort for consistency


def build_sequences(words):
    """Build intermediary character sequences for words, adding unique backlink references."""
    sequences = {}

    for word in words:
        previous = ""
        for i in range(len(word)):
            current = word[: i + 1]
            if current not in sequences:
                sequences[current] = {
                    "id": current,
                    "root_ref": previous if previous in sequences else None,
                    "leaf_char": word[i],
                    "backlinks": set(),
                }
            if previous in sequences:
                sequences[previous]["backlinks"].add(
                    current
                )  # Add backlink to previous sequence ensuring uniqueness
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
    input_file = os.path.join(script_dir, "../data/words.txt")
    output_file = os.path.join(script_dir, "../src/data/database_lemma.generated.json")

    if not os.path.isfile(input_file):
        print("Error: Input file does not exist.")
        return

    words = get_words_from_file(input_file)
    sequences = build_sequences(words)
    save_to_json(list(sequences.values()), output_file)

    print(f"Output written to {output_file}")


if __name__ == "__main__":
    main()
