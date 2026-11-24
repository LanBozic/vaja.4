import React, { useState, useEffect } from 'react';
import { View, Text, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Detail'>;

interface PokemonDetail {
  height: number;
  weight: number;
  sprites: {
    front_default: string;
  };
  types: Array<{
    type: {
      name: string;
    };
  }>;
}

export default function DetailScreen({ route }: Props) {
  const { pokemonUrl, pokemonName } = route.params;
  const [details, setDetails] = useState<PokemonDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await fetch(pokemonUrl);
        const data = await response.json();
        setDetails(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [pokemonUrl]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#e3350d" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {details && (
        <>
          <Image source={{ uri: details.sprites.front_default }} style={styles.image} />
          <Text style={styles.title}>{pokemonName.toUpperCase()}</Text>
          
          <View style={styles.box}>
            <Text style={styles.text}>Višina: {details.height}</Text>
            <Text style={styles.text}>Teža: {details.weight}</Text>
            <Text style={styles.text}>
              Tip(i): {details.types.map((t) => t.type.name).join(', ')}
            </Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', backgroundColor: '#fff', padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: 180, height: 180, marginBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  box: { width: '100%', backgroundColor: '#f0f0f0', padding: 20, borderRadius: 10 },
  text: { fontSize: 18, marginBottom: 10, color: '#444' },
});