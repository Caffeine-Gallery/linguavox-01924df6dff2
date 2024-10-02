import Bool "mo:base/Bool";

import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Text "mo:base/Text";
import Principal "mo:base/Principal";

actor {
  type Translation = {
    original: Text;
    translated: Text;
    language: Text;
    user: Principal;
  };

  stable var translationsStable : [Translation] = [];
  let translations = Buffer.Buffer<Translation>(0);

  public shared(msg) func init() : async () {
    for (t in translationsStable.vals()) {
      translations.add(t);
    };
  };

  public shared(msg) func addTranslation(original: Text, translated: Text, language: Text) : async () {
    let newTranslation : Translation = {
      original = original;
      translated = translated;
      language = language;
      user = msg.caller;
    };
    translations.add(newTranslation);
  };

  public shared query(msg) func getTranslations() : async [Translation] {
    return Array.filter(Buffer.toArray(translations), func (t: Translation) : Bool {
      return t.user == msg.caller;
    });
  };

  system func preupgrade() {
    translationsStable := Buffer.toArray(translations);
  };

  system func postupgrade() {
    for (t in translationsStable.vals()) {
      translations.add(t);
    };
  };
}
