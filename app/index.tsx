import React, { useState, useEffect } from "react";
import { Text, TextInput, View, Button, StyleSheet, FlatList, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Definindo o tipo para a despesa
interface Despesa {
  id: number;
  descricao: string;
  valor: string;
}

const API_URL = "http://127.0.0.1:8000/api/v1";

const Index: React.FC = () => {
  const [descricao, setDescricao] = useState<string>("");
  const [valor, setValor] = useState<string>("");
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [token, setToken] = useState<string>("");

  // Carrega o token salvo no AsyncStorage
  const carregarToken = async () => {
    const tokenSalvo = await AsyncStorage.getItem("token");
    if (tokenSalvo) {
      setToken(tokenSalvo);
    } else {
      Alert.alert("Erro", "Token de autenticação não encontrado.");
    }
  };

  // Busca despesas da API
  const buscarDespesas = async () => {
    try {
      const response = await fetch(`${API_URL}/despesas`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await response.json();
      setDespesas(json.data || []);
    } catch (error) {
      console.error("Erro ao buscar despesas:", error);
    }
  };

  // Adiciona uma nova despesa
  const adicionarDespesa = async () => {
    if (!descricao || !valor) {
      Alert.alert("Atenção", "Preencha todos os campos.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/despesas`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          descricao,
          valor: parseFloat(valor),
          data: new Date().toISOString().split("T")[0],
        }),
      });

      const json = await response.json();

      if (response.ok) {
        setDespesas((prev) => [...prev, json.data]);
        setDescricao("");
        setValor("");
      } else {
        Alert.alert("Erro", json.message || "Erro ao adicionar despesa.");
      }
    } catch (error) {
      console.error("Erro ao adicionar despesa:", error);
    }
  };

  // Remove uma despesa
  const removerDespesa = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/despesas/${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setDespesas((prev) => prev.filter((d) => d.id !== id));
      } else {
        Alert.alert("Erro", "Não foi possível remover a despesa.");
      }
    } catch (error) {
      console.error("Erro ao remover despesa:", error);
    }
  };

  // Carrega o token e busca as despesas ao montar o componente
  useEffect(() => {
    const iniciar = async () => {
      await carregarToken();
    };
    iniciar();
  }, []);

  // Quando o token estiver carregado, buscar as despesas
  useEffect(() => {
    if (token) {
      buscarDespesas();
    }
  }, [token]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Despesas</Text>

      <TextInput
        style={styles.input}
        placeholder="Descrição"
        value={descricao}
        onChangeText={setDescricao}
      />

      <TextInput
        style={styles.input}
        placeholder="Valor"
        keyboardType="numeric"
        value={valor}
        onChangeText={setValor}
      />

      <Button title="Adicionar Despesa" onPress={adicionarDespesa} />

      <FlatList
        data={despesas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.descricao}</Text>
            <Text style={styles.cardValue}>R$ {item.valor}</Text>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removerDespesa(item.id)}
            >
              <Text style={styles.removeButtonText}>Remover</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f8f8",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 10,
    borderRadius: 5,
    width: "100%",
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  cardValue: {
    fontSize: 16,
    marginTop: 5,
    color: "#888",
  },
  removeButton: {
    marginTop: 10,
    backgroundColor: "#ff5c5c",
    padding: 8,
    borderRadius: 5,
    alignItems: "center",
  },
  removeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default Index;
