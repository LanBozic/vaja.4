import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface PokemonData {
  id: number;
  name: string;
  sprites: {
    front_default: string | null;
    other?: {
      "official-artwork"?: {
        front_default: string | null;
      };
    };
  };
  types: { type: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
}

export default function App() {
  const [query, setQuery] = useState("");
  const [pokemon, setPokemon] = useState<PokemonData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchPokemon() {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) {
      setError("Vpiši ime ali številko Pokémona.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(cleanQuery)}`
      );
      if (!response.ok) {
        throw new Error("Pokémona s tem imenom ali ID-jem ni bilo mogoče najti.");
      }
      const data: PokemonData = await response.json();
      setPokemon(data);
    } catch (err) {
      setPokemon(null);
      setError(err instanceof Error ? err.message : "Prišlo je do napake pri nalaganju.");
    } finally {
      setLoading(false);
    }
  }

  const imageUrl =
    pokemon?.sprites.other?.["official-artwork"]?.front_default ||
    pokemon?.sprites.front_default ||
    null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pokédex</Text>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          onSubmitEditing={fetchPokemon}
        />
        <TouchableOpacity style={styles.button} onPress={fetchPokemon}>
          <Text style={styles.buttonText}>Poišči</Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator size="large" style={styles.loader} />}
      {error && <Text style={styles.error}>{error}</Text>}

      {pokemon && !loading && (
        <View style={styles.card}>
          <Text style={styles.name}>
            #{pokemon.id} {pokemon.name.toUpperCase()}
          </Text>

          {imageUrl && (
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="contain"
            />
          )}

          <Text style={styles.subtitle}>
            Tip:{" "}
            {pokemon.types.map((item) => item.type.name).join(", ")}
          </Text>

          <View style={styles.statsBox}>
            {pokemon.stats.slice(0, 3).map((s) => (
              <Text key={s.stat.name} style={styles.statText}>
                {s.stat.name}: {s.base_stat}
              </Text>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#f4f6f9",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 16,
  },
  searchRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d0d7de",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  button: {
    backgroundColor: "#e3350d",
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  loader: {
    marginTop: 24,
  },
  error: {
    color: "#b42318",
    marginTop: 8,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    marginTop: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  image: {
    width: 180,
    height: 180,
    marginVertical: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 4,
  },
  statsBox: {
    marginTop: 12,
    width: "100%",
    gap: 4,
  },
  statText: {
    fontSize: 14,
  },
});