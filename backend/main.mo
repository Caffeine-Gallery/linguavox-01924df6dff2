import Func "mo:base/Func";

import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Text "mo:base/Text";

actor {
  // Define a type for storing translations
  type Translation = {
    original: Text;
    translated: Text;
    language: Text;
  };

  // Create a stable variable to store translations
  stable var translationsStable : [Translation] = [];

  // Buffer to hold translations
  let translations = Buffer.Buffer<Translation>(0);

  // Initialize the buffer with stable data
  public func init() : async () {
    for (t in translationsStable.vals()) {
      translations.add(t);
    };
  };

  // Function to add a new translation
  public func addTranslation(original: Text, translated: Text, language: Text) : async () {
    let newTranslation : Translation = {
      original = original;
      translated = translated;
      language = language;
    };
    translations.add(newTranslation);
  };

  // Function to get all translations
  public query func getTranslations() : async [Translation] {
    return Buffer.toArray(translations);
  };

  // Pre-upgrade hook to save the buffer state
  system func preupgrade() {
    translationsStable := Buffer.toArray(translations);
  };

  // Post-upgrade hook to restore the buffer state
  system func postupgrade() {
    for (t in translationsStable.vals()) {
      translations.add(t);
    };
  };
}
