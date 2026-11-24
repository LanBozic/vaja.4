import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  StyleSheet,
  Button,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

interface PokemonItem {
  name: string;
  url: string;
}

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const [pokemons, setPokemons] = useState<PokemonItem[]>([]);
  const [filteredPokemons, setFilteredPokemons] = useState<PokemonItem[]>([]);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPokemons = async () => {
    try {
      setError(null);
      const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=150');
      
      if (!response.ok) {
        throw new Error('Napaka pri povezavi s strežnikom.');
      }
      
      const data = await response.json();
      setPokemons(data.results);
      setFilteredPokemons(data.results);
    } catch (err) {
      setError('Ni mogoče naložiti podatkov. Preveri internetno povezavo.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPokemons();
  }, []);

  const handleSearch = (text: string) => {
    setSearch(text);
    if (text) {
      const filtered = pokemons.filter((item) =>
        item.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredPokemons(filtered);
    } else {
      setFilteredPokemons(pokemons);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setSearch('');
    fetchPokemons();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#e3350d" />
        <Text style={styles.loadingText}>Nalaganje Pokémonov...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <Button 
          title="Poskusi znova" 
          onPress={() => { 
            setLoading(true); 
            fetchPokemons(); 
          }} 
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Išči Pokémona po imenu..."
        placeholderTextColor="#888"
        value={search}
        onChangeText={handleSearch}
      />

      <FlatList
        data={filteredPokemons}
        keyExtractor={(item) => item.name}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => {
          const id = item.url.split('/').filter(Boolean).pop();
          const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => 
                navigation.navigate('Detail', { 
                  pokemonName: item.name, 
                  pokemonUrl: item.url 
                })
              }
            >
              <Image source={{ uri: imageUrl }} style={styles.image} />
              <Text style={styles.name}>{item.name.toUpperCase()}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 12 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 10, color: '#555', fontSize: 16 },
  errorText: { color: '#d9534f', fontSize: 16, marginBottom: 15, textAlign: 'center' },
  searchInput: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
    elevation: 2,
  },
  image: { width: 60, height: 60, marginRight: 15 },
  name: { fontSize: 18, fontWeight: 'bold', color: '#333' },
});